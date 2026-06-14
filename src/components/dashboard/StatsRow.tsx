import { ArrowDownCircle, ArrowUpCircle, Activity } from "lucide-react";
import { formatMoney } from "../../utils/format";

interface StatsRowProps {
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
}

export function StatsRow({ totalDeposits, totalWithdrawals, currentBalance }: StatsRowProps) {
  return (
    <div className="stats-row">
      <div className="stats-card">
        <ArrowDownCircle size={16} className="stats-icon stats-icon--deposit" aria-hidden="true" />
        <div className="stats-label">總存款</div>
        <div className="stats-value stats-value--deposit">{formatMoney(totalDeposits)}</div>
      </div>
      <div className="stats-card">
        <ArrowUpCircle size={16} className="stats-icon stats-icon--withdraw" aria-hidden="true" />
        <div className="stats-label">總提款</div>
        <div className="stats-value stats-value--withdraw">{formatMoney(totalWithdrawals)}</div>
      </div>
      <div className="stats-card">
        <Activity size={16} className="stats-icon stats-icon--net" aria-hidden="true" />
        <div className="stats-label">淨儲蓄</div>
        <div className="stats-value stats-value--net">{formatMoney(currentBalance)}</div>
      </div>
    </div>
  );
}
