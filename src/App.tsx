import { useState, useCallback, useEffect } from "react";
import { TabBar } from "./components/layout/TabBar";
import { FloatingButton } from "./components/layout/FloatingButton";
import { ConfirmDialog } from "./components/common/ConfirmDialog";
import { LoginScreen } from "./components/auth/LoginScreen";
import { BalanceCard } from "./components/dashboard/BalanceCard";
import { StatsRow } from "./components/dashboard/StatsRow";
import { SavingsGoalCard } from "./components/dashboard/SavingsGoalCard";
import { GoalModal } from "./components/dashboard/GoalModal";
import { TransactionList } from "./components/transactions/TransactionList";
import { TransactionModal } from "./components/transactions/TransactionModal";
import { useAuth } from "./hooks/useAuth";
import { useLogin } from "./hooks/useLogin";
import { useTransactions } from "./hooks/useTransactions";
import { useSavingsGoals } from "./hooks/useSavingsGoals";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "./services/transactionService";
import { addGoal, deleteGoal } from "./services/goalService";
import type { ChildId, LedgerEntry, SavingsGoal, TransactionType } from "./types";

type ModalState =
  | { kind: "none" }
  | { kind: "tx-add" }
  | { kind: "tx-edit"; item: LedgerEntry }
  | { kind: "tx-delete"; item: LedgerEntry }
  | { kind: "goal-add" }
  | { kind: "goal-delete"; goal: SavingsGoal };

export default function App() {
  const [activeChild, setActiveChild] = useState<ChildId>("sister");
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const { user, role, isLoading: authLoading } = useAuth();
  const { login, logout, isVerifying, pinError, clearPinError } = useLogin();
  
  const { ledger, currentBalance, thisMonthInterest, totalDeposits, totalWithdrawals, isLoading: txLoading } =
    useTransactions(user, activeChild);
  const { goals } = useSavingsGoals(user, activeChild);

  // Force active child if logged in as a child
  useEffect(() => {
    if (role === "sister") setActiveChild("sister");
    if (role === "brother") setActiveChild("brother");
  }, [role]);

  // ─── Guard: require parent mode ───────────────────────────────────────────
  const requireParent = useCallback(
    (action: () => void) => {
      if (role === "parent") {
        action();
      } else {
        alert("只有家長可以執行此操作。");
      }
    },
    [role]
  );

  // ─── Transaction handlers ──────────────────────────────────────────────────
  const handleOpenAdd = () => requireParent(() => setModal({ kind: "tx-add" }));

  const handleOpenEdit = (item: LedgerEntry) =>
    requireParent(() => setModal({ kind: "tx-edit", item }));

  const handleOpenDelete = (item: LedgerEntry) =>
    requireParent(() => setModal({ kind: "tx-delete", item }));

  const handleTxSubmit = async (data: {
    type: TransactionType;
    amount: number;
    date: string;
    note: string | null;
  }) => {
    if (modal.kind === "tx-add") {
      await addTransaction({ child: activeChild, ...data });
    } else if (modal.kind === "tx-edit") {
      await updateTransaction(modal.item.id, data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (modal.kind !== "tx-delete") return;
    await deleteTransaction(modal.item.id);
    setModal({ kind: "none" });
  };

  // ─── Goal handlers ─────────────────────────────────────────────────────────
  const handleOpenAddGoal = () => requireParent(() => setModal({ kind: "goal-add" }));
  const handleOpenDeleteGoal = (goal: SavingsGoal) =>
    requireParent(() => setModal({ kind: "goal-delete", goal }));

  const handleGoalSubmit = async (data: {
    name: string;
    targetAmount: number;
    emoji: string;
  }) => {
    await addGoal({ child: activeChild, ...data });
  };

  const handleGoalDeleteConfirm = async () => {
    if (modal.kind !== "goal-delete") return;
    await deleteGoal(modal.goal.id);
    setModal({ kind: "none" });
  };

  const closeModal = () => {
    setModal({ kind: "none" });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return <div className="login-screen"><p>載入中...</p></div>;
  }

  if (!role) {
    return (
      <LoginScreen
        onLogin={login}
        isLoading={isVerifying}
        error={pinError}
        clearError={clearPinError}
      />
    );
  }

  const isParent = role === "parent";

  return (
    <>
      {/* Tab navigation - Only show if parent */}
      {isParent && (
        <TabBar activeChild={activeChild} onChange={setActiveChild} />
      )}

      {/* Main content */}
      <main className="main-content" style={!isParent ? { paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' } : {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
           <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
             {activeChild === 'sister' ? '姐姐的帳戶 👧' : '弟弟的帳戶 👦'}
           </h1>
           <button 
             onClick={logout}
             style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'var(--border)', color: 'var(--text)' }}
           >登出</button>
        </div>

        <BalanceCard
          activeChild={activeChild}
          currentBalance={currentBalance}
          thisMonthInterest={thisMonthInterest}
        />

        <StatsRow
          totalDeposits={totalDeposits}
          totalWithdrawals={totalWithdrawals}
          currentBalance={currentBalance}
        />

        <SavingsGoalCard
          goals={goals}
          currentBalance={currentBalance}
          isParent={isParent}
          onAddGoal={handleOpenAddGoal}
          onDeleteGoal={handleOpenDeleteGoal}
        />

        <TransactionList
          ledger={ledger}
          isParent={isParent}
          isLoading={txLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </main>

      {/* Floating action button */}
      {isParent && (
        <FloatingButton
          activeChild={activeChild}
          disabled={false}
          onClick={handleOpenAdd}
        />
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      {/* Add / Edit transaction */}
      {(modal.kind === "tx-add" || modal.kind === "tx-edit") && (
        <TransactionModal
          editItem={modal.kind === "tx-edit" ? modal.item : null}
          onSubmit={handleTxSubmit}
          onClose={closeModal}
        />
      )}

      {/* Delete transaction confirmation */}
      {modal.kind === "tx-delete" && (
        <ConfirmDialog
          title="刪除交易"
          message={`確定要刪除這筆 ${modal.item.type === "deposit" ? "存款" : "提款"} 紀錄嗎？此操作無法復原。`}
          confirmLabel="確認刪除"
          onConfirm={handleDeleteConfirm}
          onCancel={closeModal}
        />
      )}

      {/* Add goal */}
      {modal.kind === "goal-add" && (
        <GoalModal
          child={activeChild}
          onSubmit={handleGoalSubmit}
          onClose={closeModal}
        />
      )}

      {/* Delete goal confirmation */}
      {modal.kind === "goal-delete" && (
        <ConfirmDialog
          title="刪除目標"
          message={`確定要刪除「${modal.goal.name}」目標嗎？`}
          confirmLabel="確認刪除"
          onConfirm={handleGoalDeleteConfirm}
          onCancel={closeModal}
        />
      )}
    </>
  );
}
