"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { RecurringItemCard } from "@/components/recurring/recurring-item-card";
import { RecurringExpenseForm } from "@/components/forms/recurring-expense-form";
import type { RecurringExpenseDTO } from "@/types";

export function RecurringExpensesTab() {
  const [items, setItems] = useState<RecurringExpenseDTO[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringExpenseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecurringExpenseDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const fetchItems = useCallback(() => {
    fetch("/api/recurring-expenses")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => toast.error("Unable to load recurring expenses."));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSaved = () => {
    setModalOpen(false);
    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recurring-expenses/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to delete recurring expense.");
        return;
      }
      toast.success("Recurring expense deleted.");
      setDeleteTarget(null);
      fetchItems();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (item: RecurringExpenseDTO) => {
    try {
      const res = await fetch(`/api/recurring-expenses/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          amount: item.amount,
          category: item.category,
          frequency: item.frequency,
          startDate: item.startDate,
          active: !item.active,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(item.active ? "Marked inactive." : "Marked active.");
      fetchItems();
    } catch {
      toast.error("Unable to update. Please try again.");
    }
  };

  const handleLogNow = async (item: RecurringExpenseDTO) => {
    setLoggingId(item._id);
    try {
      const res = await fetch(`/api/recurring-expenses/${item._id}/log`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to log this expense.");
        return;
      }
      toast.success(`${item.name} logged as an expense for today.`);
      fetchItems();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setLoggingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Recurring Expense
        </Button>
      </div>

      {items === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring expenses added."
          description="Add rent, subscriptions, or bills you pay regularly."
        >
          <Button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Recurring Expense
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <RecurringItemCard
              key={item._id}
              name={item.name}
              subtitle={item.category}
              amount={item.amount}
              frequency={item.frequency}
              nextDate={item.nextDueDate}
              active={item.active}
              logging={loggingId === item._id}
              onEdit={() => {
                setEditingItem(item);
                setModalOpen(true);
              }}
              onDelete={() => setDeleteTarget(item)}
              onToggleActive={() => handleToggleActive(item)}
              onLogNow={() => handleLogNow(item)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Recurring Expense" : "Add Recurring Expense"}
        size="md"
      >
        <RecurringExpenseForm
          item={editingItem}
          onSuccess={handleSaved}
          onCancel={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete recurring expense"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
