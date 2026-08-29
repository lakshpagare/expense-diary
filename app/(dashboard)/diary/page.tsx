import { getSession } from "@/lib/auth";
import { getDiaryEntries } from "@/lib/data";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { DiaryDayCard } from "@/components/diary/diary-day-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpenText } from "lucide-react";

export default async function DiaryPage() {
  const session = await getSession();
  const userId = session!.userId;

  await connectDB();
  const [groups, categories] = await Promise.all([
    getDiaryEntries(userId, 30),
    Category.find({ userId }).lean(),
  ]);
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Expense Diary</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your day-by-day spending timeline for the last 30 days.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={BookOpenText}
          title="No expenses found."
          description="Start tracking your spending by adding your first expense."
          showAddExpense
        />
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <DiaryDayCard
              key={group.date}
              group={group}
              categories={serializedCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
}
