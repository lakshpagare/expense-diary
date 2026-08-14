"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AddExpenseButton } from "@/components/expenses/add-expense-button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatTime12h } from "@/lib/utils";
import type { ExpenseDTO } from "@/types";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);

      const res = await fetch(`/api/expenses?${params}`);
      const data = await res.json();
      setExpenses(data.expenses ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error("Error loading expenses:", err);
      toast.error("Unable to load expenses");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadExpenses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadExpenses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Expense deleted");
      loadExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast.error("Unable to delete expense");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            All Expenses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all your expenses
          </p>
        </div>
        <AddExpenseButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">
                Search by place, category, or payment method
              </Label>
              <Input
                id="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No expenses found. {search && "Try adjusting your search."}
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon icon="receipt" className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">
                        {expense.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.place ? `${expense.place} • ` : ""}
                        {expense.date}
                        {expense.time ? ` ${formatTime12h(expense.time)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ₹{expense.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.paymentMethod}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
