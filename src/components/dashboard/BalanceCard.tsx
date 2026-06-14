import { TrendingUp } from "lucide-react";
import { formatMoney } from "../../utils/format";
import type { ChildId } from "../../types";

interface BalanceCardProps {
  activeChild: ChildId;
  currentBalance: number;
  thisMonthInterest: number;
}

export function BalanceCard({ activeChild, currentBalance, thisMonthInterest }: BalanceCardProps) {
  const isSister = activeChild === "sister";
  const projectedInterest = currentBalance * 0.10;

  return (
    <div className={`balance-card ${isSister ? "balance-card--sister" : "balance-card--brother"}`}>
      <p className="balance-label">當前可用結餘</p>
      <div className={`balance-amount ${isSister ? "balance-amount--sister" : "balance-amount--brother"}`}>
        {formatMoney(currentBalance)}
      </div>

      <div className="balance-stats">
        <div className="balance-stat-box">
          <TrendingUp size={12} className="balance-stat-icon" aria-hidden="true" />
          <div className="balance-stat-label">本月已發利息</div>
          <div className="balance-stat-value balance-stat-value--interest">
            +{formatMoney(thisMonthInterest)}
          </div>
        </div>
        <div className="balance-stat-box">
          <TrendingUp size={12} className="balance-stat-icon" aria-hidden="true" />
          <div className="balance-stat-label">下月預計 (10%)</div>
          <div className="balance-stat-value balance-stat-value--projected">
            ~{formatMoney(projectedInterest)}
          </div>
        </div>
      </div>
    </div>
  );
}
