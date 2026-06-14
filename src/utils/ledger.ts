import type { ChildId, LedgerEntry, LedgerResult, Transaction } from "../types";

const MONTHLY_INTEREST_RATE = 0.10;

/**
 * Pure function: computes a full time-series ledger from raw transactions.
 * Simulates monthly interest accrual on the 1st of each month,
 * reconstructs per-day balances, and returns summary statistics.
 */
export function computeLedger(
  transactions: Transaction[],
  child: ChildId
): LedgerResult {
  const childTxs = transactions.filter((tx) => tx.child === child);

  if (childTxs.length === 0) {
    return {
      ledger: [],
      currentBalance: 0,
      thisMonthInterest: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
    };
  }

  // Group transactions by date string
  const txByDate: Record<string, Transaction[]> = {};
  for (const tx of childTxs) {
    if (!txByDate[tx.date]) txByDate[tx.date] = [];
    txByDate[tx.date].push(tx);
  }

  const dates = Object.keys(txByDate).sort();
  const [ey, em, ed] = dates[0].split("-").map(Number);
  const earliestDate = new Date(ey, em - 1, ed);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  let currentDate = new Date(earliestDate);
  let balance = 0;
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  const generatedLedger: LedgerEntry[] = [];
  let calcThisMonthInterest = 0;

  while (currentDate <= today) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    const dateString = `${y}-${m}-${d}`;

    // 1. Apply monthly interest on the 1st of each month (before that day's txns)
    if (currentDate.getDate() === 1 && balance > 0) {
      const interest = Math.floor(balance * MONTHLY_INTEREST_RATE * 100) / 100;
      if (interest > 0) {
        balance += interest;
        generatedLedger.push({
          id: `int-${child}-${dateString}`,
          child,
          date: dateString,
          type: "interest",
          amount: interest,
          note: null,
          timestamp: currentDate.getTime(),
          balanceAfter: balance,
          isSystem: true,
        });
        if (`${y}-${m}` === currentMonthStr) {
          calcThisMonthInterest = interest;
        }
      }
    }

    // 2. Process transactions for this date
    const dayTxs = txByDate[dateString];
    if (dayTxs) {
      for (const tx of dayTxs) {
        if (tx.type === "deposit") {
          balance += tx.amount;
          totalDeposits += tx.amount;
        } else if (tx.type === "withdraw") {
          balance -= tx.amount;
          totalWithdrawals += tx.amount;
        }
        generatedLedger.push({
          ...tx,
          balanceAfter: balance,
          isSystem: false,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    ledger: generatedLedger.reverse(),
    currentBalance: balance,
    thisMonthInterest: calcThisMonthInterest,
    totalDeposits,
    totalWithdrawals,
  };
}
