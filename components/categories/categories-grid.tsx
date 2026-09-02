"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { CategoryCard } from "./category-card";
import { CategoryModal } from "./category-modal";
import { CategoryModalProvider, useCategoryModal } from "./category-modal-context";
import type { CategoryDTO } from "@/types";

function CategoriesGridInner() {
  const [categories, setCategories] = useState<CategoryDTO[] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { openAddModal, openEditModal, registerOnSaved } = useCategoryModal();

  const fetchCategories = useCallback(() => {
    fetch("/api/categories?withSpend=1")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => toast.error("Unable to load categories."));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    return registerOnSaved(fetchCategories);
  }, [registerOnSaved, fetchCategories]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to delete category.");
        return;
      }
      toast.success("Category deleted successfully.");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize your expenses and set optional monthly limits.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      </div>

      {categories === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet."
          description="Create your first category to start organizing your expenses."
        >
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard
              key={c._id}
              category={c}
              onEdit={() => openEditModal(c)}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      <CategoryModal />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

export function CategoriesGrid() {
  return (
    <CategoryModalProvider>
      <CategoriesGridInner />
    </CategoryModalProvider>
  );
}
