import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ExpenseDetailActions } from "@/components/expenses/expense-detail-actions";
import { formatCurrency, formatDate, formatTime12h } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const expenseDoc = await Expense.findOne({ _id: id, userId: session!.userId }).lean();
  if (!expenseDoc) notFound();

  const categoryDoc = await Category.findOne({
    userId: session!.userId,
    name: expenseDoc.category,
  }).lean();

  const expense = JSON.parse(JSON.stringify(expenseDoc));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/expenses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to all expenses
      </Link>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${categoryDoc?.color ?? "#94a3b8"}20` }}
            >
              <CategoryIcon
                icon={categoryDoc?.icon ?? "more-horizontal"}
                color={categoryDoc?.color}
                className="h-6 w-6"
              />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">{expense.item}</p>
              <p className="text-sm text-muted-foreground">{expense.place}</p>
            </div>
            <p className="ml-auto text-2xl font-semibold text-foreground">
              {formatCurrency(expense.amount)}
            </p>
          </div>

          <div className="divide-y divide-border">
            <DetailRow label="Date" value={formatDate(expense.date)} />
            <DetailRow label="Time" value={formatTime12h(expense.time)} />
            <DetailRow label="Category" value={expense.category} />
            <DetailRow label="Place" value={expense.place} />
            <DetailRow label="Item" value={expense.item} />
            {expense.description && (
              <DetailRow label="Description" value={expense.description} />
            )}
            <DetailRow label="Payment method" value={expense.paymentMethod} />
            {expense.notes && <DetailRow label="Notes" value={expense.notes} />}
            <DetailRow
              label="Created"
              value={new Date(expense.createdAt).toLocaleString("en-IN")}
            />
            <DetailRow
              label="Last updated"
              value={new Date(expense.updatedAt).toLocaleString("en-IN")}
            />
          </div>

          <div className="pt-2">
            <ExpenseDetailActions expense={expense} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
