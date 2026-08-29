import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
import Budget from "@/models/Budget";
import User from "@/models/User";
import Income from "@/models/Income";
import { todayISO } from "@/lib/utils";
import { INCOME_CATEGORIES } from "@/types";
import type { ExpenseDTO, IncomeDTO } from "@/types";

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

/* ------------------------------------------------------------------ */
/* Income module - additive functions, do not modify anything above    */
/* ------------------------------------------------------------------ */

export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage, 0-100 (can exceed 100 if savings > income doesn't happen, but can be negative)
  incomeChangePercent: number | null;
  prevMonthIncome: number;
}

async function monthIncomeTotal(uid: mongoose.Types.ObjectId, start: string, end: string) {
  const agg = await Income.aggregate([
    { $match: { userId: uid, date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return agg[0]?.total ?? 0;
}

export async function getFinancialOverview(
  userId: string,
  totalExpenses: number
): Promise<FinancialOverview> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const { start: monthStart, end: monthEnd } = monthRange(now.getFullYear(), now.getMonth() + 1);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { start: prevStart, end: prevEnd } = monthRange(
    prevDate.getFullYear(),
    prevDate.getMonth() + 1
  );

  const [totalIncome, prevMonthIncome] = await Promise.all([
    monthIncomeTotal(uid, monthStart, monthEnd),
    monthIncomeTotal(uid, prevStart, prevEnd),
  ]);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0;
  const incomeChangePercent =
    prevMonthIncome > 0
      ? Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100)
      : null;

  return { totalIncome, totalExpenses, netSavings, savingsRate, incomeChangePercent, prevMonthIncome };
}

export interface IncomeCategoryBreakdownItem {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  icon: string;
  color: string;
}

export async function getIncomeCategoryBreakdown(
  userId: string
): Promise<IncomeCategoryBreakdownItem[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);

  const results = await Income.aggregate([
    { $match: { userId: uid, date: { $gte: start, $lte: end } } },
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const meta = new Map(INCOME_CATEGORIES.map((c) => [c.name, c]));
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

export interface TopIncomeSource {
  source: string;
  amount: number;
}

export async function getTopIncomeSources(userId: string, limit = 5): Promise<TopIncomeSource[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);

  const results = await Income.aggregate([
    { $match: { userId: uid, date: { $gte: start, $lte: end } } },
    { $group: { _id: "$source", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $limit: limit },
  ]);

  return results.map((r) => ({ source: r._id as string, amount: r.total as number }));
}

export async function getRecentIncome(userId: string, limit = 5): Promise<IncomeDTO[]> {
  await connectDB();
  const income = await Income.find({ userId })
    .sort({ date: -1, time: -1, createdAt: -1 })
    .limit(limit)
    .lean();
  return JSON.parse(JSON.stringify(income));
}

export async function getFinancialInsights(
  userId: string,
  overview: FinancialOverview,
  incomeBreakdown: IncomeCategoryBreakdownItem[],
  expenseInsights: SpendingInsight[]
): Promise<SpendingInsight[]> {
  const insights: SpendingInsight[] = [];

  if (overview.incomeChangePercent !== null) {
    const direction = overview.incomeChangePercent >= 0 ? "increased" : "decreased";
    insights.push({
      text: `Your income has ${direction} by ${Math.abs(overview.incomeChangePercent)}% compared with last month.`,
    });
  }

  if (overview.totalIncome > 0) {
    insights.push({
      text:
        overview.savingsRate >= 0
          ? `You saved ${overview.savingsRate}% of your income this month.`
          : `You spent ${Math.abs(overview.savingsRate)}% more than your income this month.`,
    });

    const expenseShare = Math.round((overview.totalExpenses / overview.totalIncome) * 1000) / 10;
    insights.push({ text: `Your expenses are ${expenseShare}% of your income.` });
  }

  if (incomeBreakdown.length > 0) {
    insights.push({
      text: `${incomeBreakdown[0].category} contributes ${incomeBreakdown[0].percentage}% of your total income.`,
    });
  }

  return [...insights, ...expenseInsights];
}

/* ------------------------------------------------------------------ */
/* Expense Diary                                                       */
/* ------------------------------------------------------------------ */

export interface DiaryDayGroup {
  date: string;
  total: number;
  entries: ExpenseDTO[];
}

export async function getDiaryEntries(userId: string, days = 30): Promise<DiaryDayGroup[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceISO = since.toISOString().slice(0, 10);

  const expenses = await Expense.find({ userId: uid, date: { $gte: sinceISO } })
    .sort({ date: -1, time: -1 })
    .lean();

  const grouped = new Map<string, ExpenseDTO[]>();
  for (const e of expenses) {
    const list = grouped.get(e.date) ?? [];
    list.push(e as unknown as ExpenseDTO);
    grouped.set(e.date, list);
  }

  const groups: DiaryDayGroup[] = Array.from(grouped.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, entries]) => ({
      date,
      total: entries.reduce((s, e) => s + e.amount, 0),
      entries: JSON.parse(JSON.stringify(entries)),
    }));

  return groups;
}

/* ------------------------------------------------------------------ */
/* Calendar (Income + Expenses combined)                               */
/* ------------------------------------------------------------------ */

export interface CalendarDayTotal {
  date: string; // YYYY-MM-DD
  income: number;
  expenses: number;
}

export async function getCalendarMonthTotals(
  userId: string,
  year: number,
  month: number // 1-12
): Promise<CalendarDayTotal[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [expenseAgg, incomeAgg] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$date", total: { $sum: "$amount" } } },
    ]),
    Income.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$date", total: { $sum: "$amount" } } },
    ]),
  ]);

  const expenseByDate = new Map(expenseAgg.map((r) => [r._id as string, r.total as number]));
  const incomeByDate = new Map(incomeAgg.map((r) => [r._id as string, r.total as number]));

  const allDates = new Set([...expenseByDate.keys(), ...incomeByDate.keys()]);

  return Array.from(allDates)
    .sort()
    .map((date) => ({
      date,
      income: incomeByDate.get(date) ?? 0,
      expenses: expenseByDate.get(date) ?? 0,
    }));
}

export async function getDayDetails(
  userId: string,
  date: string
): Promise<{ income: IncomeDTO[]; expenses: ExpenseDTO[] }> {
  await connectDB();
  const [income, expenses] = await Promise.all([
    Income.find({ userId, date }).sort({ time: -1 }).lean(),
    Expense.find({ userId, date }).sort({ time: -1 }).lean(),
  ]);
  return {
    income: JSON.parse(JSON.stringify(income)),
    expenses: JSON.parse(JSON.stringify(expenses)),
  };
}

/* ------------------------------------------------------------------ */
/* Reports & Analytics                                                 */
/* ------------------------------------------------------------------ */

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM
  label: string; // "Jan 2026"
  total: number;
}

async function monthlyTrend(
  model: typeof Expense | typeof Income,
  uid: mongoose.Types.ObjectId,
  months: number
): Promise<MonthlyTrendPoint[]> {
  const now = new Date();
  const points: MonthlyTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const { start, end } = monthRange(year, month);
    const agg = await model.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    points.push({
      month: `${year}-${String(month).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      total: agg[0]?.total ?? 0,
    });
  }

  return points;
}

export interface MonthlyComparisonPoint {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

export async function getMonthlyComparison(
  userId: string,
  months = 6
): Promise<MonthlyComparisonPoint[]> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const [incomeTrend, expenseTrend] = await Promise.all([
    monthlyTrend(Income, uid, months),
    monthlyTrend(Expense, uid, months),
  ]);

  return incomeTrend.map((inc, i) => ({
    month: inc.month,
    label: inc.label,
    income: inc.total,
    expenses: expenseTrend[i].total,
    savings: inc.total - expenseTrend[i].total,
  }));
}

export interface PaymentMethodBreakdownItem {
  method: string;
  amount: number;
  percentage: number;
}

export interface TopPlaceItem {
  place: string;
  amount: number;
}

export interface ExpenseAnalytics {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
  paymentMethodBreakdown: PaymentMethodBreakdownItem[];
  topPlaces: TopPlaceItem[];
  monthlyTrend: MonthlyTrendPoint[];
}

export async function getExpenseAnalytics(userId: string, months = 6): Promise<ExpenseAnalytics> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);

  const [statsAgg, paymentAgg, placeAgg, trend] = await Promise.all([
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          avg: { $avg: "$amount" },
          max: { $max: "$amount" },
          min: { $min: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$place", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),
    monthlyTrend(Expense, uid, months),
  ]);

  const stats = statsAgg[0] ?? { total: 0, avg: 0, max: 0, min: 0, count: 0 };
  const grandTotal = paymentAgg.reduce((s, r) => s + r.total, 0);

  return {
    total: stats.total,
    average: Math.round(stats.avg ?? 0),
    highest: stats.max ?? 0,
    lowest: stats.count > 0 ? stats.min ?? 0 : 0,
    count: stats.count,
    paymentMethodBreakdown: paymentAgg.map((r) => ({
      method: r._id as string,
      amount: r.total as number,
      percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 1000) / 10 : 0,
    })),
    topPlaces: placeAgg.map((r) => ({ place: r._id as string, amount: r.total as number })),
    monthlyTrend: trend,
  };
}

export interface IncomeAnalytics {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
  growthPercent: number | null;
  recurringTotal: number;
  oneTimeTotal: number;
  monthlyTrend: MonthlyTrendPoint[];
}

export async function getIncomeAnalytics(userId: string, months = 6): Promise<IncomeAnalytics> {
  await connectDB();
  const uid = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const { start, end } = monthRange(now.getFullYear(), now.getMonth() + 1);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { start: prevStart, end: prevEnd } = monthRange(
    prevDate.getFullYear(),
    prevDate.getMonth() + 1
  );

  const [statsAgg, typeAgg, prevAgg, trend] = await Promise.all([
    Income.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          avg: { $avg: "$amount" },
          max: { $max: "$amount" },
          min: { $min: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Income.aggregate([
      { $match: { userId: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: "$incomeType", total: { $sum: "$amount" } } },
    ]),
    Income.aggregate([
      { $match: { userId: uid, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    monthlyTrend(Income, uid, months),
  ]);

  const stats = statsAgg[0] ?? { total: 0, avg: 0, max: 0, min: 0, count: 0 };
  const prevTotal = prevAgg[0]?.total ?? 0;
  const recurringTotal = typeAgg.find((r) => r._id === "recurring")?.total ?? 0;
  const oneTimeTotal = typeAgg.find((r) => r._id === "one-time")?.total ?? 0;

  return {
    total: stats.total,
    average: Math.round(stats.avg ?? 0),
    highest: stats.max ?? 0,
    lowest: stats.count > 0 ? stats.min ?? 0 : 0,
    count: stats.count,
    growthPercent:
      prevTotal > 0 ? Math.round(((stats.total - prevTotal) / prevTotal) * 100) : null,
    recurringTotal,
    oneTimeTotal,
    monthlyTrend: trend,
  };
}

