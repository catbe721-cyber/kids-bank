import { useState, useEffect, useCallback, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import type { User } from "firebase/auth";
import { auth, functions } from "../config/firebase";

interface VerifyPinResult {
  success: boolean;
  expiresAt: number;
  sessionDurationSeconds: number;
}

interface UseParentModeReturn {
  isParent: boolean;
  expiresAt: number | null;
  secondsRemaining: number;
  isVerifying: boolean;
  pinError: string | null;
  verifyPin: (pin: string) => Promise<boolean>;
  revokeAccess: () => Promise<void>;
  clearPinError: () => void;
}

const verifyParentPinFn = httpsCallable<{ pin: string }, VerifyPinResult>(
  functions,
  "verifyParentPin"
);
const revokeParentAccessFn = httpsCallable<void, { success: boolean }>(
  functions,
  "revokeParentAccess"
);

/**
 * Manages the parent session: PIN verification, expiry countdown,
 * auto-revocation, and token refresh after claims change.
 */
export function useParentMode(user: User | null): UseParentModeReturn {
  const [isParent, setIsParent] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session from token claims on mount / user change
  useEffect(() => {
    if (!user) return;
    user.getIdTokenResult().then((result) => {
      const { role, exp } = result.claims as { role?: string; exp?: number };
      if (role === "parent" && exp && exp > Math.floor(Date.now() / 1000)) {
        setIsParent(true);
        setExpiresAt(exp);
      }
    });
  }, [user]);

  // Countdown timer
  useEffect(() => {
    if (!isParent || !expiresAt) return;

    const tick = () => {
      const remaining = expiresAt - Math.floor(Date.now() / 1000);
      if (remaining <= 0) {
        setIsParent(false);
        setExpiresAt(null);
        setSecondsRemaining(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setSecondsRemaining(remaining);
      }
    };

    tick(); // immediate tick
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isParent, expiresAt]);

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!user) return false;
      setIsVerifying(true);
      setPinError(null);

      try {
        const result = await verifyParentPinFn({ pin });
        const { expiresAt: exp } = result.data;

        // Force token refresh so the new claims are immediately in the client token
        await auth.currentUser?.getIdToken(true);

        setIsParent(true);
        setExpiresAt(exp);
        return true;
      } catch (err: unknown) {
        const msg =
          (err as { message?: string })?.message ??
          "PIN 驗證失敗，請稍後再試。";
        setPinError(msg);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [user]
  );

  const revokeAccess = useCallback(async () => {
    try {
      await revokeParentAccessFn();
      await auth.currentUser?.getIdToken(true);
    } catch {
      // Best-effort revocation
    } finally {
      setIsParent(false);
      setExpiresAt(null);
      setSecondsRemaining(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, []);

  const clearPinError = useCallback(() => setPinError(null), []);

  return {
    isParent,
    expiresAt,
    secondsRemaining,
    isVerifying,
    pinError,
    verifyPin,
    revokeAccess,
    clearPinError,
  };
}
