import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../config/firebase";
import type { UserRole } from "../types";

interface UseAuthReturn {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email) {
        if (u.email.startsWith("parent@")) setRole("parent");
        else if (u.email.startsWith("sister@")) setRole("sister");
        else if (u.email.startsWith("brother@")) setRole("brother");
        else setRole(null);
      } else {
        setRole(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, role, isLoading };
}
