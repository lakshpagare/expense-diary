import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SpendingInsight } from "@/lib/data";

export function FinancialInsights({ insights }: { insights: SpendingInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand" />
          <h3 className="text-base font-semibold text-foreground">Financial Insights</h3>
        </div>
        <ul className="mt-3 space-y-2.5">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{insight.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
