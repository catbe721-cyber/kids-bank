import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { getTodayDateString } from "../../utils/format";
import type { LedgerEntry, TransactionType } from "../../types";

const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100];

interface TransactionModalProps {
  /** null = add mode, LedgerEntry = edit mode */
  editItem?: LedgerEntry | null;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    date: string;
    note: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export function TransactionModal({ editItem, onSubmit, onClose }: TransactionModalProps) {
  const isEdit = !!editItem;
  const [type, setType] = useState<TransactionType>(
    editItem?.type === "deposit" || editItem?.type === "withdraw"
      ? editItem.type
      : "deposit"
  );
  const [amount, setAmount] = useState(editItem ? String(editItem.amount) : "");
  const [date, setDate] = useState(editItem?.date ?? getTodayDateString());
  const [note, setNote] = useState(editItem?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isDeposit = type === "deposit";

  const handleQuickAmount = useCallback((amt: number) => {
    setAmount((prev) => {
      const current = parseFloat(prev) || 0;
      return String(Math.round((current + amt) * 100) / 100);
    });
    setValidationError(null);
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError("請輸入有效金額。");
      return;
    }
    if (!date) {
      setValidationError("請選擇日期。");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: Math.round(parsedAmount * 100) / 100,
        date,
        note: note.trim() || null,
      });
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      setValidationError("儲存失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trap focus in modal
  useEffect(() => {
    const el = document.getElementById("tx-modal-amount");
    el?.focus();
  }, []);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "編輯交易" : "新增交易"}
    >
      <div className={`tx-modal ${isDeposit ? "tx-modal--deposit" : "tx-modal--withdraw"}`}>
        {/* Header */}
        <div className="tx-modal-header">
          <h2 className={`tx-modal-title ${isDeposit ? "tx-modal-title--deposit" : "tx-modal-title--withdraw"}`}>
            {isEdit ? "編輯交易" : isDeposit ? "新增存款" : "新增提款"}
          </h2>
          <button
            id="tx-modal-close-btn"
            className="modal-close-inline"
            onClick={onClose}
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-form" noValidate>
          {/* Type Toggle */}
          <div className="tx-type-toggle" role="group" aria-label="交易類型">
            <button
              type="button"
              id="tx-type-deposit"
              className={`tx-type-btn ${isDeposit ? "tx-type-btn--deposit-active" : "tx-type-btn--inactive"}`}
              onClick={() => setType("deposit")}
            >
              存款
            </button>
            <button
              type="button"
              id="tx-type-withdraw"
              className={`tx-type-btn ${!isDeposit ? "tx-type-btn--withdraw-active" : "tx-type-btn--inactive"}`}
              onClick={() => setType("withdraw")}
            >
              提款
            </button>
          </div>

          {/* Quick amounts */}
          <div className="quick-amounts" role="group" aria-label="快速金額">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                id={`quick-amt-${amt}`}
                className="quick-amt-btn"
                onClick={() => handleQuickAmount(amt)}
              >
                +${amt}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="form-field">
            <label className="form-label" htmlFor="tx-modal-amount">金額</label>
            <input
              id="tx-modal-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={handleAmountChange}
              className={`form-input form-input--large ${isDeposit ? "form-input--deposit-focus" : "form-input--withdraw-focus"}`}
              placeholder="0.00"
              autoComplete="off"
            />
          </div>

          {/* Date */}
          <div className="form-field">
            <label className="form-label" htmlFor="tx-modal-date">
              日期 <span className="form-label-hint">(支援 Backdate)</span>
            </label>
            <input
              id="tx-modal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`form-input ${isDeposit ? "form-input--deposit-focus" : "form-input--withdraw-focus"}`}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Note */}
          <div className="form-field">
            <label className="form-label" htmlFor="tx-modal-note">
              備註 <span className="form-label-hint">(選填)</span>
            </label>
            <input
              id="tx-modal-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`form-input ${isDeposit ? "form-input--deposit-focus" : "form-input--withdraw-focus"}`}
              placeholder="例如：壓歲錢、買玩具..."
              maxLength={100}
            />
          </div>

          {/* Validation error */}
          {validationError && (
            <p className="form-error" role="alert">{validationError}</p>
          )}

          {/* Submit */}
          <button
            id="tx-modal-submit"
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-full ${isDeposit ? "btn-deposit" : "btn-withdraw"}`}
          >
            {isSubmitting ? "儲存中..." : isEdit ? "確認更新" : "確認儲存"}
          </button>
        </form>
      </div>
    </div>
  );
}
