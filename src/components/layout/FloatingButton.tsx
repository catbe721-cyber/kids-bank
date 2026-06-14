import { Plus } from "lucide-react";
import type { ChildId } from "../../types";

interface FloatingButtonProps {
  activeChild: ChildId;
  disabled?: boolean;
  onClick: () => void;
}

export function FloatingButton({ activeChild, disabled, onClick }: FloatingButtonProps) {
  return (
    <button
      id="fab-add-transaction"
      className={`fab ${activeChild === "sister" ? "fab--sister" : "fab--brother"}`}
      onClick={onClick}
      disabled={disabled}
      aria-label="新增交易"
    >
      <Plus size={32} />
    </button>
  );
}
