import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../config/firebase";
import type { ChildId, SavingsGoal } from "../types";

interface UseSavingsGoalsReturn {
  goals: SavingsGoal[];
  isLoading: boolean;
}

export function useSavingsGoals(
  user: User | null,
  activeChild: ChildId
): UseSavingsGoalsReturn {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "savings_goals"),
      where("child", "==", activeChild)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: SavingsGoal[] = snapshot.docs
          .map((doc) => {
            const d = doc.data();
            const ts =
              d.createdAt instanceof Timestamp ? d.createdAt.toMillis() : 0;
            return {
              id: doc.id,
              child: d.child,
              name: d.name,
              targetAmount: d.targetAmount,
              emoji: d.emoji,
              createdAt: ts,
            } as SavingsGoal;
          })
          .filter((g) => g.child === activeChild);
          
        data.sort((a, b) => a.createdAt - b.createdAt);
        
        setGoals(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Goals read error:", err);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user, activeChild]);

  return { goals, isLoading };
}
