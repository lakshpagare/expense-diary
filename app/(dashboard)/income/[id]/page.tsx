import { notFound } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import Income from "@/models/Income";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { IncomeDetailActions } from "@/components/income/income-detail-actions";
import { formatCurrency, formatDate, formatTime12h } from "@/lib/utils";
import { INCOME_CATEGORIES } from "@/types";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function IncomeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const incomeDoc = await Income.findOne({ _id: id, userId: session!.userId }).lean();
  if (!incomeDoc) notFound();

  const income = JSON.parse(JSON.stringify(incomeDoc));
  const categoryMeta = INCOME_CATEGORIES.find((c) => c.name === income.category);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/income"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to income
      </Link>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${categoryMeta?.color ?? "#94a3b8"}20` }}
            >
              <CategoryIcon
                icon={categoryMeta?.icon ?? "more-horizontal"}
                color={categoryMeta?.color}
                className="h-6 w-6"
              />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">{income.source}</p>
              <p className="text-sm text-muted-foreground">{income.category}</p>
            </div>
            <p className="ml-auto text-2xl font-semibold text-brand">
              +{formatCurrency(income.amount)}
            </p>
          </div>

          <div className="divide-y divide-border">
            <DetailRow label="Category" value={income.category} />
            <DetailRow label="Source" value={income.source} />
            <DetailRow label="Date" value={formatDate(income.date)} />
            <DetailRow label="Time" value={formatTime12h(income.time)} />
            <DetailRow
              label="Income Type"
              value={income.incomeType === "one-time" ? "One-time" : "Recurring"}
            />
            {income.description && (
              <DetailRow label="Description" value={income.description} />
            )}
            {income.notes && <DetailRow label="Notes" value={income.notes} />}
            <DetailRow
              label="Created"
              value={new Date(income.createdAt).toLocaleString("en-IN")}
            />
            <DetailRow
              label="Last updated"
              value={new Date(income.updatedAt).toLocaleString("en-IN")}
            />
          </div>

          <div className="pt-2">
            <IncomeDetailActions income={income} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
