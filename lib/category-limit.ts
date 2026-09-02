import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import mongoose from "mongoose";

export interface CategoryLimitStatus {
  category: string;
  percentage: number;
  limit: number;
}

/**
 * If the given category has a monthly limit set, computes this month's
 * total spend for it (as of `date`'s month) and returns status info when
 * spend is at or over 100% of the limit. Returns null otherwise. This is
 * informational only - it never blocks the expense from being saved.
 */
export async function getCategoryLimitStatus(
  userId: string,
  categoryName: string,
  date: string
): Promise<CategoryLimitStatus | null> {
  await connectDB();

  const category = await Category.findOne({ userId, name: categoryName });
  if (!category?.monthlyLimit || category.monthlyLimit <= 0) {
    return null;
  }

  const [year, month] = date.split("-");
  const monthStart = `${year}-${month}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const monthEnd = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

  const agg = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        category: categoryName,
        date: { $gte: monthStart, $lte: monthEnd },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const monthTotal = agg[0]?.total ?? 0;
  const percentage = Math.round((monthTotal / category.monthlyLimit) * 100);

  if (percentage >= 100) {
    return { category: category.name, percentage, limit: category.monthlyLimit };
  }

  return null;
}
