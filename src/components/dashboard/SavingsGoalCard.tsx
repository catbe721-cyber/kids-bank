import { Plus, Target } from "lucide-react";
import { formatMoney } from "../../utils/format";
import type { SavingsGoal } from "../../types";

interface SavingsGoalCardProps {
  goals: SavingsGoal[];
  currentBalance: number;
  isParent: boolean;
  onAddGoal: () => void;
  onDeleteGoal: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({
  goals,
  currentBalance,
  isParent,
  onAddGoal,
  onDeleteGoal,
}: SavingsGoalCardProps) {
  if (goals.length === 0 && !isParent) return null;

  return (
    <div className="goals-section">
      <div className="goals-header">
        <h3 className="goals-title">
          <Target size={14} aria-hidden="true" />
          存錢目標
        </h3>
        {isParent && (
          <button
            id="goal-add-btn"
            className="goals-add-btn"
            onClick={onAddGoal}
            aria-label="新增目標"
          >
            <Plus size={14} /> 新增
          </button>
        )}
      </div>

      {goals.length === 0 && (
        <p className="goals-empty">尚無存錢目標，家長可新增！</p>
      )}

      {goals.map((goal) => {
        const progress = Math.min(currentBalance / goal.targetAmount, 1);
        const progressPct = Math.round(progress * 100);
        const isComplete = progress >= 1;

        return (
          <div
            key={goal.id}
            className={`goal-item ${isComplete ? "goal-item--complete" : ""}`}
          >
            <div className="goal-info">
              <span className="goal-emoji" aria-hidden="true">{goal.emoji}</span>
              <div>
                <div className="goal-name">
                  {goal.name}
                  {isComplete && <span className="goal-badge">🎉 達成！</span>}
                </div>
                <div className="goal-amounts">
                  <span className="goal-current">{formatMoney(currentBalance)}</span>
                  <span className="goal-sep">/</span>
                  <span className="goal-target">{formatMoney(goal.targetAmount)}</span>
                </div>
              </div>
            </div>
            <div className="goal-right">
              <span className="goal-pct">{progressPct}%</span>
              {isParent && (
                <button
                  id={`goal-delete-${goal.id}`}
                  className="goal-delete-btn"
                  onClick={() => onDeleteGoal(goal)}
                  aria-label={`刪除目標 ${goal.name}`}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="goal-progress-track">
              <div
                className={`goal-progress-fill ${isComplete ? "goal-progress-fill--complete" : ""}`}
                style={{ width: `${progressPct}%` }}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${goal.name} 進度 ${progressPct}%`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
