"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { useIncomeModal } from "@/components/income/income-modal-context";
import type { IncomeDTO } from "@/types";

export function IncomeDetailActions({ income }: { income: IncomeDTO }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { openEditModal, registerOnSaved } = useIncomeModal();

  useEffect(() => {
    return registerOnSaved(() => router.refresh());
  }, [registerOnSaved, router]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/income/${income._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to delete income.");
        return;
      }
      toast.success("Income deleted successfully.");
      router.push("/income");
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
        <Button variant="outline" onClick={() => openEditModal(income)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete Income?"
        message="This income record will be permanently removed."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
