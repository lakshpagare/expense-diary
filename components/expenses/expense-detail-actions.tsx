"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { useExpenseModal } from "@/components/expenses/expense-modal-context";
import type { ExpenseDTO } from "@/types";

export function ExpenseDetailActions({ expense }: { expense: ExpenseDTO }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { openEditModal, registerOnSaved } = useExpenseModal();

  // If the expense gets edited from this page, refresh the server data
  useEffect(() => {
    return registerOnSaved(() => router.refresh());
  }, [registerOnSaved, router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${expense._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to delete expense.");
        return;
      }
      toast.success("Expense deleted successfully.");
      router.push("/expenses");
      router.refresh();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => openEditModal(expense)}>
          <Pencil className="h-4 w-4" />
          Edit Expense
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete Expense
        </Button>
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
