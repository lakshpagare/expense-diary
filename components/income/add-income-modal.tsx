"use client";

import { Modal } from "@/components/ui/modal";
import { IncomeForm } from "@/components/forms/income-form";
import { useIncomeModal } from "./income-modal-context";

export function AddIncomeModal() {
  const { open, editingIncome, closeModal, notifySaved } = useIncomeModal();

  const handleSuccess = () => {
    closeModal();
    notifySaved();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title={editingIncome ? "Edit Income" : "Add Income"}
      description={
        editingIncome ? "Update the details of this income record." : "Log a new income record."
      }
      size="md"
    >
      <IncomeForm income={editingIncome} onSuccess={handleSuccess} onCancel={closeModal} />
    </Modal>
  );
}
