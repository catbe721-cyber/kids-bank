import { Plus, Minus, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "../../utils/format";
import type { LedgerEntry } from "../../types";

interface TransactionItemProps {
  item: LedgerEntry;
  isParent: boolean;
  onEdit: (item: LedgerEntry) => void;
  onDelete: (item: LedgerEntry) => void;
}

export function TransactionItem({ item, isParent, onEdit, onDelete }: TransactionItemProps) {
  const isDeposit = item.type === "deposit";
  const isWithdraw = item.type === "withdraw";
  const isInterest = item.type === "interest";

  return (
    <div className={`tx-item ${isInterest ? "tx-item--interest" : "tx-item--normal"}`}>
      {/* Icon */}
      <div className={`tx-icon ${isDeposit ? "tx-icon--deposit" : isWithdraw ? "tx-icon--withdraw" : "tx-icon--interest"}`}
        aria-hidden="true"
      >
        {isDeposit && <Plus size={16} />}
        {isWithdraw && <Minus size={16} />}
        {isInterest && <TrendingUp size={16} />}
      </div>

      {/* Details */}
      <div className="tx-details">
        <div className="tx-type">
          {isInterest ? "每月複利 10%" : isDeposit ? "存款" : "提款"}
        </div>
        {item.note && (
          <div className="tx-note" title={item.note}>
            📝 {item.note}
          </div>
        )}
      </div>

      {/* Amount + balance */}
      <div className="tx-amount-col">
        <div className={`tx-amount ${isDeposit ? "tx-amount--deposit" : isWithdraw ? "tx-amount--withdraw" : "tx-amount--interest"}`}>
          {isWithdraw ? "-" : "+"}{formatMoney(item.amount)}
        </div>
        <div className="tx-balance-after">結餘 {formatMoney(item.balanceAfter)}</div>
      </div>

      {/* Actions — only for non-system items in parent mode */}
      {!item.isSystem && isParent && (
        <div className="tx-actions">
          <button
            id={`tx-edit-${item.id}`}
            className="tx-action-btn tx-action-btn--edit"
            onClick={() => onEdit(item)}
            aria-label="編輯交易"
          >
            <Pencil size={14} />
          </button>
          <button
            id={`tx-delete-${item.id}`}
            className="tx-action-btn tx-action-btn--delete"
            onClick={() => onDelete(item)}
            aria-label="刪除交易"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
