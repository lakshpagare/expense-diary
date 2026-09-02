"use client";

import { Modal } from "@/components/ui/modal";
import { CategoryForm } from "@/components/forms/category-form";
import { useCategoryModal } from "./category-modal-context";

export function CategoryModal() {
  const { open, editingCategory, closeModal, notifySaved } = useCategoryModal();

  const handleSuccess = () => {
    closeModal();
    notifySaved();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title={editingCategory ? "Edit Category" : "Create Category"}
      description={
        editingCategory
          ? "Update this category's details."
          : "Add a custom category for your expenses."
      }
      size="md"
    >
      <CategoryForm category={editingCategory} onSuccess={handleSuccess} onCancel={closeModal} />
    </Modal>
  );
}
