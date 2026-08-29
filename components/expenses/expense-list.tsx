"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Search, Eye, Pencil, Trash2, Receipt, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal";
import { useExpenseModal } from "@/components/expenses/expense-modal-context";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { ExpenseDTO, CategoryDTO } from "@/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function ExpenseList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [result, setResult] = useState<{
    key: string;
    expenses: ExpenseDTO[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  } | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);

  const requestKey = JSON.stringify({ search, category, page, limit });
  const loading = !result || result.key !== requestKey;
  const expenses = result?.key === requestKey ? result.expenses : [];
  const pagination =
    result?.key === requestKey
      ? result.pagination
      : { total: 0, page, limit, totalPages: 1 };

  const [searchInput, setSearchInput] = useState(search);

  const { openEditModal, registerOnSaved } = useExpenseModal();

  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`/expenses?${params.toString()}`);
    },
    [router, searchParams]
  );

  const fetchExpenses = useCallback(async (key: string) => {
    try {
      const parsed = JSON.parse(key) as {
        search: string;
        category: string;
        page: number;
        limit: number;
      };
      const params = new URLSearchParams();
      if (parsed.search) params.set("search", parsed.search);
      if (parsed.category !== "all") params.set("category", parsed.category);
      params.set("page", String(parsed.page));
      params.set("limit", String(parsed.limit));

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return {
        key,
        expenses: (data.expenses ?? []) as ExpenseDTO[],
        pagination: data.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
      };
    } catch {
      toast.error("Unable to load expenses.");
      return { key, expenses: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchExpenses(requestKey).then((data) => {
      if (!cancelled) setResult(data);
    });
    return () => {
      cancelled = true;
    };
  }, [requestKey, fetchExpenses]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  const refetch = useCallback(() => {
    fetchExpenses(requestKey).then((data) => setResult(data));
  }, [fetchExpenses, requestKey]);

  // Re-fetch whenever an expense is saved (added/edited) elsewhere via the modal
  useEffect(() => {
    return registerOnSaved(refetch);
  }, [registerOnSaved, refetch]);

  // Debounced search-as-you-type
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const catMeta = new Map(categories.map((c) => [c.name, c]));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Unable to delete expense.");
        return;
      }
      toast.success("Expense deleted successfully.");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + basic filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by place, item, description..."
            className="pl-9"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
          className="w-44"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={limit}
          onChange={(e) => updateParams({ limit: e.target.value, page: 1 })}
          className="w-32"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found."
          description={
            search || category !== "all"
              ? "Try adjusting your search or filters."
              : "Start tracking your spending by adding your first expense."
          }
          showAddExpense={!search && category === "all"}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((e) => {
                  const meta = catMeta.get(e.category);
                  return (
                    <tr key={e._id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">{formatShortDate(e.date)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <CategoryIcon icon={meta?.icon ?? "more-horizontal"} color={meta?.color} className="h-3.5 w-3.5" />
                          {e.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{e.place}</td>
                      <td className="px-4 py-3 text-foreground">{e.item}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.paymentMethod}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(e.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/expenses/${e._id}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 sm:hidden">
            {expenses.map((e) => {
              const meta = catMeta.get(e.category);
              return (
                <div key={e._id} className="rounded-2xl border border-border bg-card p-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${meta?.color ?? "#94a3b8"}20` }}
                    >
                      <CategoryIcon icon={meta?.icon ?? "more-horizontal"} color={meta?.color} className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{e.item}</p>
                        <p className="shrink-0 text-sm font-semibold text-foreground">
                          {formatCurrency(e.amount)}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {e.place} · {formatShortDate(e.date)} · {e.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-2.5">
                    <Link
                      href={`/expenses/${e._id}`}
                      className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Link>
                    <button
                      onClick={() => openEditModal(e)}
                      className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(e)}
                      className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => updateParams({ page: p })}
            />
          </div>
        </>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
