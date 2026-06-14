import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { ChildId } from "../types";

const COLLECTION = "savings_goals";

export interface AddGoalInput {
  child: ChildId;
  name: string;
  targetAmount: number;
  emoji: string;
}

export async function addGoal(data: AddGoalInput): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateGoal(
  id: string,
  data: Partial<AddGoalInput>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteGoal(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
