import { useState, useCallback } from "react";
import { TabBar } from "./components/layout/TabBar";
import { FloatingButton } from "./components/layout/FloatingButton";
import { ErrorBanner } from "./components/common/ErrorBanner";
import { ConfirmDialog } from "./components/common/ConfirmDialog";
import { PinKeypad } from "./components/auth/PinKeypad";
import { ParentBadge } from "./components/auth/ParentBadge";
import { BalanceCard } from "./components/dashboard/BalanceCard";
import { StatsRow } from "./components/dashboard/StatsRow";
import { SavingsGoalCard } from "./components/dashboard/SavingsGoalCard";
import { GoalModal } from "./components/dashboard/GoalModal";
import { TransactionList } from "./components/transactions/TransactionList";
import { TransactionModal } from "./components/transactions/TransactionModal";
import { useAuth } from "./hooks/useAuth";
import { useParentMode } from "./hooks/useParentMode";
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
  | { kind: "pin"; onSuccess: () => void }
  | { kind: "tx-add" }
  | { kind: "tx-edit"; item: LedgerEntry }
  | { kind: "tx-delete"; item: LedgerEntry }
  | { kind: "goal-add" }
  | { kind: "goal-delete"; goal: SavingsGoal };

export default function App() {
  const [activeChild, setActiveChild] = useState<ChildId>("sister");
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const { user, authError, isLoading: authLoading } = useAuth();
  const parentMode = useParentMode(user);
  const { ledger, currentBalance, thisMonthInterest, totalDeposits, totalWithdrawals, isLoading: txLoading } =
    useTransactions(user, activeChild);
  const { goals } = useSavingsGoals(user, activeChild);

  // ─── Guard: require parent mode ───────────────────────────────────────────
  const requireParent = useCallback(
    (action: () => void) => {
      if (parentMode.isParent) {
        action();
      } else {
        setModal({ kind: "pin", onSuccess: action });
      }
    },
    [parentMode.isParent]
  );

  // ─── PIN handlers ──────────────────────────────────────────────────────────
  const handlePinSubmit = async (pin: string) => {
    const success = await parentMode.verifyPin(pin);
    if (success && modal.kind === "pin") {
      const onSuccess = modal.onSuccess;
      setModal({ kind: "none" });
      onSuccess();
    }
  };

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
    parentMode.clearPinError();
    setModal({ kind: "none" });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Auth error */}
      {authError && <ErrorBanner message={authError} />}

      {/* Tab navigation */}
      <TabBar activeChild={activeChild} onChange={setActiveChild} />

      {/* Main content */}
      <main className="main-content">
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
          isParent={parentMode.isParent}
          onAddGoal={handleOpenAddGoal}
          onDeleteGoal={handleOpenDeleteGoal}
        />

        <TransactionList
          ledger={ledger}
          isParent={parentMode.isParent}
          isLoading={authLoading || txLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </main>

      {/* Floating action button */}
      <FloatingButton
        activeChild={activeChild}
        disabled={!!authError}
        onClick={handleOpenAdd}
      />

      {/* Parent mode badge */}
      {parentMode.isParent && (
        <ParentBadge
          secondsRemaining={parentMode.secondsRemaining}
          onRevoke={parentMode.revokeAccess}
        />
      )}

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}

      {/* PIN keypad */}
      {modal.kind === "pin" && (
        <PinKeypad
          onSubmit={handlePinSubmit}
          isLoading={parentMode.isVerifying}
          error={parentMode.pinError}
          onClose={closeModal}
          clearError={parentMode.clearPinError}
        />
      )}

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
