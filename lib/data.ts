import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
import Budget from "@/models/Budget";
import User from "@/models/User";
import { todayISO } from "@/lib/utils";
import type { ExpenseDTO } from "@/types";

function startOfWeekISO(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export interface DashboardSummary {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  avgDaily: number;
  highestExpense: number;
  monthlyBudget: number;
  remainingBudget: number;
  monthChangePercent: number | null;
  monthExpenseCount: number;
  currency: string;
  userName: string;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);

  const now = new Date();
  const today = todayISO();
  const weekStart = startOfWeekISO(new Date());
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const { start: monthStart, end: monthEnd } = monthRange(currentYear, currentMonth);

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
    monthCount,
    user,
    budgetDoc,
  ] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: uid, date: today } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: weekStart, $lte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.findOne({ userId: uid, date: { $gte: monthStart, $lte: monthEnd } })
      .sort({ amount: -1 })
      .lean(),
    Expense.countDocuments({ userId: uid, date: { $gte: monthStart, $lte: monthEnd } }),
    User.findById(uid).lean(),
    Budget.findOne({ userId: uid, year: currentYear, month: currentMonth }).lean(),
  ]);

  const todayTotal = todayAgg[0]?.total ?? 0;
  const weekTotal = weekAgg[0]?.total ?? 0;
  const monthTotal = monthAgg[0]?.total ?? 0;
  const prevMonthTotal = prevMonthAgg[0]?.total ?? 0;
  const daysElapsed = now.getDate();
  const avgDaily = daysElapsed > 0 ? monthTotal / daysElapsed : 0;
  const monthlyBudget = budgetDoc?.amount ?? user?.monthlyBudget ?? 0;

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    avgDaily: Math.round(avgDaily),
    highestExpense: (highestAgg as { amount?: number } | null)?.amount ?? 0,
    monthlyBudget,
    remainingBudget: monthlyBudget - monthTotal,
    monthChangePercent:
      prevMonthTotal > 0
        ? Math.round(((monthTotal - prevMonthTotal) / prevMonthTotal) * 100)
        : null,
    monthExpenseCount: monthCount,
    currency: user?.currency ?? "INR",
    userName: user?.name ?? "there",
  };
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  icon: string;
  color: string;
}

export async function getCategoryBreakdown(userId: string): Promise<CategoryBreakdownItem[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);

  const [results, categories] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Category.find({ userId: uid }).lean(),
  ]);

  const meta = new Map(categories.map((c) => [c.name, c]));
  const grandTotal = results.reduce((s, r) => s + r.total, 0);

  return results.map((r) => ({
    category: r._id as string,
    amount: r.total as number,
    count: r.count as number,
    percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 1000) / 10 : 0,
    icon: meta.get(r._id)?.icon ?? "more-horizontal",
    color: meta.get(r._id)?.color ?? "#94a3b8",
  }));
}

export async function getRecentExpenses(userId: string, limit = 5): Promise<ExpenseDTO[]> {
  await connectDB();
  const expenses = await Expense.find({ userId })
    .sort({ date: -1, time: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(expenses));
}

export interface SpendingInsight {
  text: string;
}

export async function getSpendingInsights(
  userId: string,
  summary: DashboardSummary,
  breakdown: CategoryBreakdownItem[]
): Promise<SpendingInsight[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const insights: SpendingInsight[] = [];

  if (summary.monthChangePercent !== null) {
    const direction = summary.monthChangePercent >= 0 ? "increased" : "decreased";
    insights.push({
      text: `Your spending has ${direction} by ${Math.abs(summary.monthChangePercent)}% compared with last month.`,
    });
  }

  if (breakdown.length > 0) {
    insights.push({
      text: `You've spent the most on ${breakdown[0].category} this month (₹${breakdown[0].amount.toLocaleString("en-IN")}).`,
    });
  }

  insights.push({
    text: `Your average daily expense this month is ₹${summary.avgDaily.toLocaleString("en-IN")}.`,
  });

  // Highest spending day of week (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const dayAgg = await Expense.aggregate([
    { $match: { userId: uid, date: { $gte: ninetyDaysAgo.toISOString().slice(0, 10) } } },
    {
      $addFields: {
        dow: { $dayOfWeek: { $dateFromString: { dateString: "$date" } } },
      },
    },
    { $group: { _id: "$dow", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);
  const dayNames = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (dayAgg[0]) {
    insights.push({ text: `${dayNames[dayAgg[0]._id]} is typically your highest spending day.` });
  }

  // Most frequent payment method
  const paymentAgg = await Expense.aggregate([
    { $match: { userId: uid } },
    { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  if (paymentAgg[0]) {
    insights.push({ text: `${paymentAgg[0]._id} is your most frequently used payment method.` });
  }

  return insights;
}
