import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "確認",
  cancelLabel = "取消",
  isDanger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-dialog">
        <div className="confirm-icon">
          <AlertTriangle size={28} />
        </div>
        <h2 id="confirm-title" className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            id="confirm-cancel-btn"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-ok-btn"
            className={`btn ${isDanger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
        <button className="modal-close" onClick={onCancel} aria-label="關閉">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
