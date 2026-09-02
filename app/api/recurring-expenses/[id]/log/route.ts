import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import RecurringExpense from "@/models/RecurringExpense";
import Expense from "@/models/Expense";
import { getSession } from "@/lib/auth";
import { advanceDueDate } from "@/lib/recurring";
import { todayISO, nowHHMM } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
  }

  try {
    await connectDB();

    const recurring = await RecurringExpense.findOne({ _id: id, userId: session.userId });
    if (!recurring) {
      return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
    }

    const expense = await Expense.create({
      userId: session.userId,
      amount: recurring.amount,
      date: todayISO(),
      time: nowHHMM(),
      category: recurring.category,
      place: recurring.name,
      item: recurring.name,
      description: `Recurring: ${recurring.name}`,
      paymentMethod: "Other",
    });

    recurring.nextDueDate = advanceDueDate(recurring.nextDueDate, recurring.frequency);
    await recurring.save();

    return NextResponse.json({ expense, item: recurring });
  } catch (err) {
    console.error("Log recurring expense error:", err);
    return NextResponse.json(
      { error: "Unable to log this expense. Please try again." },
      { status: 500 }
    );
  }
}
