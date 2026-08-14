import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
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

    const results = await Expense.aggregate([
      { $match: { userId, date: { $gte: startISO, $lte: endISO } } },
      { $group: { _id: "$date", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);

    const totalsByDate = new Map(results.map((r) => [r._id as string, r.total as number]));

    // Fill in every day in the range so the chart has no gaps
    const series: { date: string; amount: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      series.push({ date: iso, amount: totalsByDate.get(iso) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return NextResponse.json({ series });
  } catch (err) {
    console.error("Daily trend error:", err);
    return NextResponse.json({ error: "Unable to load spending trend." }, { status: 500 });
  }
}
