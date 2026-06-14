import { onCall, CallableRequest } from "firebase-functions/v2/https";
import * as bcrypt from "bcryptjs";
import { db, auth } from "../shared/admin";
import {
  unauthenticated,
  invalidArgument,
  permissionDenied,
  tooManyRequests,
  internal,
} from "../shared/errors";

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const PARENT_SESSION_DURATION_SECONDS = 30 * 60; // 30 minutes

interface VerifyPinData {
  pin: string;
}

/**
 * Callable Cloud Function: verifyParentPin
 *
 * Accepts a 6-digit PIN from the client, bcrypt-compares it against the
 * PIN_HASH secret (stored in Firebase Secret Manager — never in client code),
 * and on success sets custom claims { role: 'parent', exp: <unix_ts> } on
 * the caller's anonymous UID, granting a 30-minute write window.
 *
 * Rate limited: 5 failed attempts per UID per 10 minutes.
 */
export const verifyParentPin = onCall(
  {
    secrets: ["PIN_HASH"],
    // Enforce App Check in production (set enforceAppCheck: true once configured)
    enforceAppCheck: false,
  },
  async (request: CallableRequest<VerifyPinData>) => {
    if (!request.auth) throw unauthenticated();

    const { pin } = request.data;
    if (!pin || typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
      throw invalidArgument("PIN must be a 6-digit number.");
    }

    const uid = request.auth.uid;
    const rateLimitRef = db.collection("rate_limits").doc(`pin_${uid}`);

    // --- Rate Limiting ---
    const now = Date.now();
    const rateLimitSnap = await rateLimitRef.get();
    if (rateLimitSnap.exists) {
      const data = rateLimitSnap.data()!;
      const windowStart: number = data.windowStart ?? 0;
      const attempts: number = data.attempts ?? 0;

      if (now - windowStart < RATE_LIMIT_WINDOW_MS && attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
        const resetIn = Math.ceil((windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000 / 60);
        throw tooManyRequests(
          `Too many failed PIN attempts. Try again in ${resetIn} minute(s).`
        );
      }
    }

    // --- PIN Verification ---
    const storedHash = process.env.PIN_HASH;
    if (!storedHash) {
      console.error("PIN_HASH secret is not configured.");
      throw internal("Server configuration error.");
    }

    const isValid = await bcrypt.compare(pin, storedHash);

    if (!isValid) {
      // Increment failed attempts
      const windowStart =
        rateLimitSnap.exists && now - (rateLimitSnap.data()!.windowStart ?? 0) < RATE_LIMIT_WINDOW_MS
          ? rateLimitSnap.data()!.windowStart
          : now;
      const prevAttempts =
        rateLimitSnap.exists && now - (rateLimitSnap.data()!.windowStart ?? 0) < RATE_LIMIT_WINDOW_MS
          ? rateLimitSnap.data()!.attempts ?? 0
          : 0;

      await rateLimitRef.set({ windowStart, attempts: prevAttempts + 1 });
      throw permissionDenied("Incorrect PIN.");
    }

    // --- Success: Set Custom Claims ---
    const expiresAt = Math.floor(Date.now() / 1000) + PARENT_SESSION_DURATION_SECONDS;

    // Merge with existing claims (setCustomUserClaims overwrites — read first)
    const user = await auth.getUser(uid);
    const existing = (user.customClaims ?? {}) as Record<string, unknown>;
    await auth.setCustomUserClaims(uid, {
      ...existing,
      role: "parent",
      exp: expiresAt,
    });

    // Clear rate limit on success
    if (rateLimitSnap.exists) {
      await rateLimitRef.delete();
    }

    return {
      success: true,
      expiresAt,
      sessionDurationSeconds: PARENT_SESSION_DURATION_SECONDS,
    };
  }
);
