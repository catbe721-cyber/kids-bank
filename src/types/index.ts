// ─── Domain Types ─────────────────────────────────────────────────────────────

export type ChildId = "sister" | "brother";
export type UserRole = "sister" | "brother" | "parent" | null;
export type TransactionType = "deposit" | "withdraw";

export interface Transaction {
  id: string;
  child: ChildId;
  type: TransactionType;
  amount: number;
  /** YYYY-MM-DD */
  date: string;
  note: string | null;
  /** Server timestamp (milliseconds) after read, FieldValue during write */
  timestamp: number;
}

export interface LedgerEntry {
  id: string;
  child: ChildId;
  type: TransactionType | "interest";
  amount: number;
  date: string;
  note: string | null;
  timestamp: number;
  balanceAfter: number;
  /** true for auto-generated monthly interest entries */
  isSystem: boolean;
}

export interface SavingsGoal {
  id: string;
  child: ChildId;
  name: string;
  targetAmount: number;
  emoji: string;
  createdAt: number;
}

// ─── Ledger Computation Result ────────────────────────────────────────────────

export interface LedgerResult {
  ledger: LedgerEntry[];
  currentBalance: number;
  thisMonthInterest: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

// ─── Parent Session ───────────────────────────────────────────────────────────

export interface ParentSession {
  isParent: boolean;
  expiresAt: number | null; // Unix timestamp in seconds, null if not in parent mode
  secondsRemaining: number;
}

// ─── Transaction Form ─────────────────────────────────────────────────────────

export interface TransactionFormData {
  type: TransactionType;
  amount: string;
  date: string;
  note: string;
}

// ─── Child Theme ──────────────────────────────────────────────────────────────

export interface ChildTheme {
  text: string;
  border: string;
  glow: string;
  bg: string;
  activeBorder: string;
  activeText: string;
  activeBg: string;
}
