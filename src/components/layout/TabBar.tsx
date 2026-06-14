import type { ChildId } from "../../types";

interface TabBarProps {
  activeChild: ChildId;
  onChange: (child: ChildId) => void;
}

export function TabBar({ activeChild, onChange }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="子女切換">
      <button
        id="tab-sister"
        role="tab"
        aria-selected={activeChild === "sister"}
        className={`tab-item ${activeChild === "sister" ? "tab-item--sister-active" : "tab-item--inactive"}`}
        onClick={() => onChange("sister")}
      >
        <span className="tab-emoji">👧</span>
        <span>姊姊</span>
      </button>
      <button
        id="tab-brother"
        role="tab"
        aria-selected={activeChild === "brother"}
        className={`tab-item ${activeChild === "brother" ? "tab-item--brother-active" : "tab-item--inactive"}`}
        onClick={() => onChange("brother")}
      >
        <span className="tab-emoji">👦</span>
        <span>弟弟</span>
      </button>
    </nav>
  );
}
