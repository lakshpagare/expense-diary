import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { todayISO } from "@/lib/utils";
import mongoose from "mongoose";

function startOfWeekISO(d: Date): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function monthRange(year: number, month: number) {
  // month is 1-12
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.userId);

    const now = new Date();
    const today = todayISO();
    const weekStart = startOfWeekISO(new Date());
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const { start: monthStart, end: monthEnd } = monthRange(currentYear, currentMonth);

    // Previous month for comparison
    const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const { start: prevMonthStart, end: prevMonthEnd } = monthRange(prevYear, prevMonth);

    const [
      todayAgg,
      weekAgg,
      monthAgg,
      prevMonthAgg,
      highestAgg,
      monthCountAgg,
      user,
      budgetDoc,
    ] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: today } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: weekStart, $lte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.findOne({ userId, date: { $gte: monthStart, $lte: monthEnd } })
        .sort({ amount: -1 })
        .lean(),
      Expense.countDocuments({ userId, date: { $gte: monthStart, $lte: monthEnd } }),
      User.findById(userId).lean(),
      Budget.findOne({ userId, year: currentYear, month: currentMonth }).lean(),
    ]);

    const todayTotal = todayAgg[0]?.total ?? 0;
    const weekTotal = weekAgg[0]?.total ?? 0;
    const monthTotal = monthAgg[0]?.total ?? 0;
    const prevMonthTotal = prevMonthAgg[0]?.total ?? 0;

    const daysElapsedInMonth = now.getDate();
    const avgDaily = daysElapsedInMonth > 0 ? monthTotal / daysElapsedInMonth : 0;

    const monthlyBudget = budgetDoc?.amount ?? user?.monthlyBudget ?? 0;
    const remainingBudget = monthlyBudget - monthTotal;

    const monthChangePercent =
      prevMonthTotal > 0
        ? Math.round(((monthTotal - prevMonthTotal) / prevMonthTotal) * 100)
        : null;

    return NextResponse.json({
      todayTotal,
      weekTotal,
      monthTotal,
      avgDaily: Math.round(avgDaily),
      highestExpense: highestAgg?.amount ?? 0,
      monthlyBudget,
      remainingBudget,
      monthChangePercent,
      monthExpenseCount: monthCountAgg,
      currency: user?.currency ?? "INR",
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return NextResponse.json(
      { error: "Unable to load dashboard summary." },
      { status: 500 }
    );
  }
}
