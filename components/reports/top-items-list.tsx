import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function TopItemsList({
  title,
  items,
  emptyText,
  positive = false,
  currency = "INR",
}: {
  title: string;
  items: { label: string; amount: number }[];
  emptyText: string;
  positive?: boolean;
  currency?: string;
}) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {items.length === 0 ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="mt-3 space-y-1">
            {items.map((item, i) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg px-2 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.label}</span>
                <span
                  className={`shrink-0 text-sm font-semibold ${positive ? "text-brand" : "text-foreground"}`}
                >
                  {positive ? "+" : ""}
                  {formatCurrency(item.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
