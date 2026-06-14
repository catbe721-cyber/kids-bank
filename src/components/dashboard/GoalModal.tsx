import React, { useState } from "react";
import { X } from "lucide-react";
import type { ChildId } from "../../types";

const EMOJI_OPTIONS = [
  "🚲", "🏀", "📱", "🎮", "🎒", "🍦", "✈️", "🎸",
  "👟", "📚", "🎨", "🐕", "🏖️", "⚽", "🎯", "🧸",
  "🦄", "🌟", "🚀", "🎪", "🍕", "🎵", "💎", "🌈",
  "🦋", "🎠", "🏆", "🎁", "🌺", "🧩",
];

interface GoalModalProps {
  child: ChildId;
  onSubmit: (data: {
    name: string;
    targetAmount: number;
    emoji: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function GoalModal({ child: _child, onSubmit, onClose }: GoalModalProps) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("請輸入目標名稱。"); return; }
    const amt = parseFloat(target);
    if (!target || isNaN(amt) || amt <= 0) { setError("請輸入有效金額。"); return; }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), targetAmount: Math.round(amt * 100) / 100, emoji });
      onClose();
    } catch {
      setError("儲存失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="新增存錢目標">
      <div className="goal-modal">
        <div className="goal-modal-header">
          <h2 className="goal-modal-title">🎯 新增存錢目標</h2>
          <button id="goal-modal-close" className="modal-close-inline" onClick={onClose} aria-label="關閉">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tx-modal-form" noValidate>
          {/* Emoji picker */}
          <div className="form-field">
            <label className="form-label">選擇圖示</label>
            <div className="emoji-grid" role="group" aria-label="選擇目標圖示">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  id={`emoji-${e}`}
                  className={`emoji-btn ${emoji === e ? "emoji-btn--selected" : ""}`}
                  onClick={() => setEmoji(e)}
                  aria-label={e}
                  aria-pressed={emoji === e}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="goal-name">目標名稱</label>
            <input
              id="goal-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              className="form-input"
              placeholder="例如：新腳踏車、電動玩具..."
              maxLength={30}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="goal-amount">目標金額</label>
            <input
              id="goal-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={target}
              onChange={(e) => { setTarget(e.target.value); setError(null); }}
              className="form-input form-input--large"
              placeholder="0.00"
            />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button
            id="goal-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="btn btn-full"
            style={{ background: "linear-gradient(135deg, #ca8a04, #eab308)", color: "white" }}
          >
            {isSubmitting ? "儲存中..." : "確認新增"}
          </button>
        </form>
      </div>
    </div>
  );
}
