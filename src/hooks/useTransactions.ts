import { useState, useEffect, useMemo } from "react";
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
import type { ChildId, LedgerResult, Transaction } from "../types";
import { computeLedger } from "../utils/ledger";

interface UseTransactionsReturn extends LedgerResult {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export function useTransactions(
  user: User | null,
  activeChild: ChildId
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "kids_savings"),
      where("child", "==", activeChild)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Transaction[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          // serverTimestamp() may be null during pending writes — fall back to 0
          const ts = d.timestamp instanceof Timestamp ? d.timestamp.toMillis() : 0;
          return {
            id: doc.id,
            child: d.child,
            type: d.type,
            amount: d.amount,
            date: d.date,
            note: d.note ?? null,
            timestamp: ts,
          } as Transaction;
        });
        
        // Sort by timestamp ascending in memory to avoid needing a Firestore composite index
        data.sort((a, b) => a.timestamp - b.timestamp);
        
        setTransactions(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore read error:", err);
        setError("無法載入交易資料。");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const ledgerResult = useMemo(
    () => computeLedger(transactions, activeChild),
    [transactions, activeChild]
  );

  return { transactions, isLoading, error, ...ledgerResult };
}
