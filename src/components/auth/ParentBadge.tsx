import { ShieldCheck, LogOut } from "lucide-react";
import { formatCountdown } from "../../utils/format";

interface ParentBadgeProps {
  secondsRemaining: number;
  onRevoke: () => void;
}

export function ParentBadge({ secondsRemaining, onRevoke }: ParentBadgeProps) {
  const isLow = secondsRemaining < 120;

  return (
    <div className={`parent-badge ${isLow ? "parent-badge--low" : ""}`} role="status" aria-live="polite">
      <ShieldCheck size={14} aria-hidden="true" />
      <span className="parent-badge-text">家長模式</span>
      <span className={`parent-badge-timer ${isLow ? "parent-badge-timer--low" : ""}`}>
        {formatCountdown(secondsRemaining)}
      </span>
      <button
        id="parent-revoke-btn"
        className="parent-badge-revoke"
        onClick={onRevoke}
        title="結束家長模式"
        aria-label="結束家長模式"
      >
        <LogOut size={12} />
      </button>
    </div>
  );
}
