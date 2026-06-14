import { formatDateLabel } from "../../utils/format";
import { TransactionItem } from "./TransactionItem";
import type { LedgerEntry } from "../../types";

interface TransactionDateGroupProps {
  date: string;
  entries: LedgerEntry[];
  isParent: boolean;
  onEdit: (item: LedgerEntry) => void;
  onDelete: (item: LedgerEntry) => void;
}

export function TransactionDateGroup({
  date,
  entries,
  isParent,
  onEdit,
  onDelete,
}: TransactionDateGroupProps) {
  return (
    <div className="tx-date-group">
      <div className="tx-date-label" aria-label={`日期：${date}`}>
        {formatDateLabel(date)}
      </div>
      <div className="tx-date-entries">
        {entries.map((item) => (
          <TransactionItem
            key={item.id}
            item={item}
            isParent={isParent}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
