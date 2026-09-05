"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw, Trash as TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency, formatShortDate, cn } from "@/lib/utils";
import { INCOME_CATEGORIES } from "@/types";
import type { TrashItemDTO } from "@/types";

const incomeCategoryMeta = new Map(INCOME_CATEGORIES.map((c) => [c.name, c]));

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function TrashList() {
  const [items, setItems] = useState<TrashItemDTO[] | null>(null);
  const [permanentTarget, setPermanentTarget] = useState<TrashItemDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchItems = useCallback(() => {
    fetch("/api/trash")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => toast.error("Unable to load Trash."));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRestore = async (item: TrashItemDTO) => {
    setRestoringId(item._id);
    try {
      const base = item.transactionType === "expense" ? "/api/expenses" : "/api/income";
      const res = await fetch(`${base}/${item._id}/restore`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to restore.");
        return;
      }
      toast.success("Restored successfully.");
      fetchItems();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentTarget) return;
    setDeleting(true);
    try {
      const base =
        permanentTarget.transactionType === "expense" ? "/api/expenses" : "/api/income";
      const res = await fetch(`${base}/${permanentTarget._id}/permanent`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to permanently delete.");
        return;
      }
      toast.success("Permanently deleted.");
      setPermanentTarget(null);
      fetchItems();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (items === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={TrashIcon}
        title="Trash is empty."
        description="Deleted expenses and income will appear here for 30 days before you can permanently remove them."
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isExpense = item.transactionType === "expense";
        const label = isExpense ? item.item : item.source;
        const meta = isExpense ? undefined : incomeCategoryMeta.get(item.category);

        return (
          <div
            key={`${item.transactionType}-${item._id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${meta?.color ?? "#94a3b8"}20` }}
            >
              <CategoryIcon icon={meta?.icon ?? "more-horizontal"} color={meta?.color} className="h-4.5 w-4.5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{label}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    isExpense
                      ? "bg-destructive/10 text-destructive"
                      : "bg-brand-light text-brand"
                  )}
                >
                  {isExpense ? "Expense" : "Income"}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {item.category} · {formatShortDate(item.date)} · Deleted {timeAgo(item.deletedAt)}
              </p>
            </div>

            <p
              className={cn(
                "shrink-0 text-sm font-semibold",
                isExpense ? "text-foreground" : "text-brand"
              )}
            >
              {isExpense ? "" : "+"}
              {formatCurrency(item.amount)}
            </p>

            <div className="flex shrink-0 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRestore(item)}
                loading={restoringId === item._id}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setPermanentTarget(item)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}

      <ConfirmDeleteModal
        open={!!permanentTarget}
        title="Delete permanently?"
        message="This cannot be undone. This transaction will be permanently removed from the database."
        onCancel={() => setPermanentTarget(null)}
        onConfirm={handlePermanentDelete}
        loading={deleting}
      />
    </div>
  );
}
