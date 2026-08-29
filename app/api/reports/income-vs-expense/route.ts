import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Income from "@/models/Income";
import { getSession } from "@/lib/auth";
import { todayISO } from "@/lib/utils";

const PERIOD_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const userId = new mongoose.Types.ObjectId(session.userId);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "30d";
    const days = PERIOD_DAYS[period] ?? 30;

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    const startISO = start.toISOString().slice(0, 10);
    const endISO = todayISO();

    const [expenseResults, incomeResults] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: startISO, $lte: endISO } } },
        { $group: { _id: "$date", total: { $sum: "$amount" } } },
      ]),
      Income.aggregate([
        { $match: { userId, date: { $gte: startISO, $lte: endISO } } },
        { $group: { _id: "$date", total: { $sum: "$amount" } } },
      ]),
    ]);

    const expenseByDate = new Map(expenseResults.map((r) => [r._id as string, r.total as number]));
    const incomeByDate = new Map(incomeResults.map((r) => [r._id as string, r.total as number]));

    const series: { date: string; income: number; expenses: number; savings: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      const income = incomeByDate.get(iso) ?? 0;
      const expenses = expenseByDate.get(iso) ?? 0;
      series.push({ date: iso, income, expenses, savings: income - expenses });
      cursor.setDate(cursor.getDate() + 1);
    }

    const totals = series.reduce(
      (acc, s) => ({
        income: acc.income + s.income,
        expenses: acc.expenses + s.expenses,
      }),
      { income: 0, expenses: 0 }
    );

    return NextResponse.json({
      series,
      totals: { ...totals, savings: totals.income - totals.expenses },
    });
  } catch (err) {
    console.error("Income vs expense trend error:", err);
    return NextResponse.json(
      { error: "Unable to load income vs expenses trend." },
      { status: 500 }
    );
  }
}
