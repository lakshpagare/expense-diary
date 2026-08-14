"use client";

import { Modal } from "@/components/ui/modal";
import { ExpenseForm } from "@/components/forms/expense-form";
import { useExpenseModal } from "./expense-modal-context";

export function AddExpenseModal() {
  const { open, editingExpense, closeModal, notifySaved } = useExpenseModal();

  const handleSuccess = () => {
    closeModal();
    notifySaved();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title={editingExpense ? "Edit Expense" : "Add Expense"}
      description={
        editingExpense
          ? "Update the details of this expense."
          : "Log a new expense in a few seconds."
      }
      size="md"
    >
      <ExpenseForm expense={editingExpense} onSuccess={handleSuccess} onCancel={closeModal} />
    </Modal>
  );
}
