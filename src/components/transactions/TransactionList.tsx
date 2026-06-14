import { useMemo } from "react";
import { History } from "lucide-react";
import { TransactionDateGroup } from "./TransactionDateGroup";
import type { LedgerEntry } from "../../types";

interface TransactionListProps {
  ledger: LedgerEntry[];
  isParent: boolean;
  isLoading: boolean;
  onEdit: (item: LedgerEntry) => void;
  onDelete: (item: LedgerEntry) => void;
}

export function TransactionList({
  ledger,
  isParent,
  isLoading,
  onEdit,
  onDelete,
}: TransactionListProps) {
  // Group entries by date (ledger is already newest-first)
  const groupedByDate = useMemo(() => {
    const map = new Map<string, LedgerEntry[]>();
    for (const entry of ledger) {
      const group = map.get(entry.date) ?? [];
      group.push(entry);
      map.set(entry.date, group);
    }
    return map;
  }, [ledger]);

  if (isLoading) {
    return (
      <div className="tx-loading" aria-live="polite">
        <div className="tx-loading-spinner" aria-hidden="true" />
        <span>載入中...</span>
      </div>
    );
  }

  return (
    <section className="tx-list-section" aria-label="交易歷史">
      <h3 className="tx-list-heading">
        <History size={14} aria-hidden="true" />
        交易歷史
      </h3>

      {ledger.length === 0 ? (
        <div className="tx-empty" aria-live="polite">
          <span className="tx-empty-icon">🏦</span>
          <p>尚無交易紀錄</p>
          <p className="tx-empty-sub">點擊右下角按鈕開始存款！</p>
        </div>
      ) : (
        <div className="tx-groups">
          {Array.from(groupedByDate.entries()).map(([date, entries]) => (
            <TransactionDateGroup
              key={date}
              date={date}
              entries={entries}
              isParent={isParent}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
