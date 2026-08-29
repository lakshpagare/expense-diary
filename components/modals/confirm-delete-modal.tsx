"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  loading,
}: ConfirmDeleteModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <div className="p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <p className="pt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/40 px-5 py-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
