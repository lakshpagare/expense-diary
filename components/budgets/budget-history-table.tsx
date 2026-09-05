import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { BudgetHistoryPoint } from "@/lib/data";

const STATUS_LABEL: Record<BudgetHistoryPoint["status"], string> = {
  "no-budget": "No budget set",
  under: "On track",
  warning: "Near limit",
  over: "Over budget",
};

const STATUS_COLOR: Record<BudgetHistoryPoint["status"], string> = {
  "no-budget": "text-muted-foreground",
  under: "text-brand",
  warning: "text-warning",
  over: "text-destructive",
};

export function BudgetHistoryTable({ history }: { history: BudgetHistoryPoint[] }) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-foreground">Budget History</h3>
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Month</th>
                <th className="px-4 py-2.5 text-right">Budget</th>
                <th className="px-4 py-2.5 text-right">Spent</th>
                <th className="px-4 py-2.5 text-right">Remaining</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((h) => (
                <tr key={`${h.year}-${h.month}`}>
                  <td className="px-4 py-2.5 text-foreground">{h.label}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {h.budget > 0 ? formatCurrency(h.budget) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-foreground">
                    {formatCurrency(h.spent)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-foreground">
                    {h.budget > 0 ? formatCurrency(h.remaining) : "—"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right text-xs font-medium",
                      STATUS_COLOR[h.status]
                    )}
                  >
                    {STATUS_LABEL[h.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
