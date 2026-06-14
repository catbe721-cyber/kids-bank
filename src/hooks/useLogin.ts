import { useState, useCallback } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import type { UserRole } from "../types";

interface UseLoginReturn {
  isVerifying: boolean;
  pinError: string | null;
  login: (role: UserRole, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearPinError: () => void;
}

export function useLogin(): UseLoginReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const login = useCallback(
    async (role: UserRole, pin: string): Promise<boolean> => {
      if (!role) return false;
      setIsVerifying(true);
      setPinError(null);
      const email = `${role}@kidsbank.local`;

      try {
        await signInWithEmailAndPassword(auth, email, pin);
        return true;
      } catch (err: any) {
        // If user not found, auto-register them with this PIN!
        // Note: Firebase Auth throws auth/invalid-credential if user not found as well in newer sdks to prevent enumeration
        try {
            await createUserWithEmailAndPassword(auth, email, pin);
            return true;
        } catch (registerErr: any) {
            if (registerErr.code === "auth/email-already-in-use") {
                // It means the user DOES exist, so the password was wrong!
                setPinError("PIN 錯誤，請再試一次。");
            } else if (registerErr.code === "auth/weak-password") {
              setPinError("PIN 至少需要 6 位數。");
            } else {
               setPinError("登入失敗，請稍後再試。");
            }
            return false;
        }
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }, []);

  const clearPinError = useCallback(() => setPinError(null), []);

  return {
    isVerifying,
    pinError,
    login,
    logout,
    clearPinError,
  };
}
