import { useState, useEffect } from "react";
import { Delete } from "lucide-react";

interface PinKeypadProps {
  onSubmit: (pin: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  clearError?: () => void;
}

const PIN_LENGTH = 6;

export function PinKeypad({ onSubmit, isLoading, error, onClose, clearError }: PinKeypadProps) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      setShake(true);
      setPin("");
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      onSubmit(pin);
    }
  }, [pin, onSubmit]);

  const handleDigit = (digit: string) => {
    if (isLoading || pin.length >= PIN_LENGTH) return;
    clearError?.();
    setPin((p) => p + digit);
  };

  const handleDelete = () => {
    if (isLoading) return;
    clearError?.();
    setPin((p) => p.slice(0, -1));
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="輸入 PIN 碼">
      <div className="pin-modal">
        <div className="pin-header">
          <div>
            <h2 className="pin-title">家長驗證</h2>
            <p className="pin-subtitle">請輸入 6 位數 PIN 碼</p>
          </div>
          <button id="pin-close-btn" className="modal-close-inline" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        {/* Dot indicators */}
        <div className={`pin-dots ${shake ? "pin-dots--shake" : ""}`} aria-label={`已輸入 ${pin.length} 位數字`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < pin.length ? "pin-dot--filled" : ""}`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="pin-error" role="alert">{error}</p>
        )}

        {/* Loading state */}
        {isLoading && (
          <p className="pin-loading">驗證中...</p>
        )}

        {/* Keypad */}
        <div className="pin-keypad" role="group" aria-label="數字鍵盤">
          {keys.map((key, i) => {
            if (key === "") return <div key={i} />;
            if (key === "del") {
              return (
                <button
                  key={i}
                  id="pin-delete-btn"
                  className="pin-key pin-key--action"
                  onClick={handleDelete}
                  disabled={isLoading || pin.length === 0}
                  aria-label="刪除"
                >
                  <Delete size={20} />
                </button>
              );
            }
            return (
              <button
                key={i}
                id={`pin-key-${key}`}
                className="pin-key pin-key--digit"
                onClick={() => handleDigit(key)}
                disabled={isLoading}
                aria-label={key}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
