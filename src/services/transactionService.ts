import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { ChildId, TransactionType } from "../types";

const COLLECTION = "kids_savings";

export interface AddTransactionInput {
  child: ChildId;
  type: TransactionType;
  amount: number;
  date: string;
  note: string | null;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  date?: string;
  note?: string | null;
}

export async function addTransaction(data: AddTransactionInput): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    timestamp: serverTimestamp(),
  });
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
