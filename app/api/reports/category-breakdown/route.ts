import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.userId);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [results, categories] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Category.find({ userId }).lean(),
    ]);

    const categoryMeta = new Map(categories.map((c) => [c.name, c]));
    const grandTotal = results.reduce((sum, r) => sum + r.total, 0);

    const breakdown = results.map((r) => ({
      category: r._id as string,
      amount: r.total as number,
      count: r.count as number,
      percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 1000) / 10 : 0,
      icon: categoryMeta.get(r._id)?.icon ?? "more-horizontal",
      color: categoryMeta.get(r._id)?.color ?? "#94a3b8",
    }));

    return NextResponse.json({ breakdown, total: grandTotal });
  } catch (err) {
    console.error("Category breakdown error:", err);
    return NextResponse.json(
      { error: "Unable to load category breakdown." },
      { status: 500 }
    );
  }
}
