import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import User from "@/models/User";
import RecurringExpense from "@/models/RecurringExpense";
import { getSession } from "@/lib/auth";
import { todayISO } from "@/lib/utils";

const LARGE_EXPENSE_THRESHOLD = 5000;

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
    const today = todayISO();

    const notifications: {
      id: string;
      type: "budget_warning" | "budget_exceeded" | "recurring_due" | "large_expense";
      title: string;
      message: string;
      date: string;
    }[] = [];

    const [monthAgg, budgetDoc, user, dueRecurring, largeExpenses] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Budget.findOne({ userId, year, month }).lean(),
      User.findById(userId).lean(),
      RecurringExpense.find({
        userId,
        active: true,
        nextDueDate: { $gte: today, $lte: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10) },
      }).lean(),
      Expense.find({ userId, date: { $gte: monthStart, $lte: monthEnd }, amount: { $gte: LARGE_EXPENSE_THRESHOLD } })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ]);

    const monthTotal = monthAgg[0]?.total ?? 0;
    const budget = budgetDoc?.amount ?? user?.monthlyBudget ?? 0;

    if (budget > 0) {
      const pct = (monthTotal / budget) * 100;
      if (pct >= 100) {
        notifications.push({
          id: "budget-exceeded",
          type: "budget_exceeded",
          title: "Budget exceeded",
          message: "Your monthly budget has been exceeded.",
          date: today,
        });
      } else if (pct >= 80) {
        notifications.push({
          id: "budget-warning",
          type: "budget_warning",
          title: "Approaching budget limit",
          message: `You've used ${Math.round(pct)}% of your monthly budget.`,
          date: today,
        });
      }
    }

    for (const r of dueRecurring) {
      notifications.push({
        id: `recurring-${r._id}`,
        type: "recurring_due",
        title: "Recurring expense due",
        message: `${r.name} (₹${r.amount.toLocaleString("en-IN")}) is due on ${r.nextDueDate}.`,
        date: r.nextDueDate,
      });
    }

    for (const e of largeExpenses) {
      notifications.push({
        id: `large-${e._id}`,
        type: "large_expense",
        title: "Large expense detected",
        message: `₹${e.amount.toLocaleString("en-IN")} spent at ${e.place} on ${e.date}.`,
        date: e.date,
      });
    }

    notifications.sort((a, b) => (a.date < b.date ? 1 : -1));

    return NextResponse.json({ notifications, unreadCount: notifications.length });
  } catch (err) {
    console.error("Notifications error:", err);
    return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 });
  }
}
