import { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../config/firebase";

interface UseAuthReturn {
  user: User | null;
  authError: string | null;
  isLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start anonymous auth
    signInAnonymously(auth).catch((error: { code: string; message: string }) => {
      console.error("Auth error:", error);
      if (error.code === "auth/configuration-not-found") {
        setAuthError(
          "請在 Firebase 控制台啟用「匿名登入」方式。"
        );
      } else {
        setAuthError(`登入失敗：${error.message}`);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, authError, isLoading };
}
