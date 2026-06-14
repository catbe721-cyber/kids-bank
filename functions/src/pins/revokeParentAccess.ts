import { onCall, CallableRequest } from "firebase-functions/v2/https";
import { auth } from "../shared/admin";
import { unauthenticated } from "../shared/errors";

/**
 * Callable Cloud Function: revokeParentAccess
 *
 * Clears the parent role and expiry from the user's custom claims,
 * effectively ending the parent session immediately.
 */
export const revokeParentAccess = onCall(
  async (request: CallableRequest<void>) => {
    if (!request.auth) throw unauthenticated();

    const uid = request.auth.uid;
    const user = await auth.getUser(uid);
    const existing = (user.customClaims ?? {}) as Record<string, unknown>;

    // Remove role and exp, preserve other claims
    const { role: _role, exp: _exp, ...rest } = existing;
    await auth.setCustomUserClaims(uid, Object.keys(rest).length > 0 ? rest : null);

    return { success: true };
  }
);
