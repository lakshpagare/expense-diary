import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import RecurringIncome from "@/models/RecurringIncome";
import Income from "@/models/Income";
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
    return NextResponse.json({ error: "Recurring income not found." }, { status: 404 });
  }

  try {
    await connectDB();

    const recurring = await RecurringIncome.findOne({ _id: id, userId: session.userId });
    if (!recurring) {
      return NextResponse.json({ error: "Recurring income not found." }, { status: 404 });
    }

    const income = await Income.create({
      userId: session.userId,
      amount: recurring.amount,
      date: todayISO(),
      time: nowHHMM(),
      category: recurring.category,
      source: recurring.source,
      description: `Recurring: ${recurring.name}`,
      incomeType: "recurring",
    });

    recurring.nextIncomeDate = advanceDueDate(recurring.nextIncomeDate, recurring.frequency);
    await recurring.save();

    return NextResponse.json({ income, item: recurring });
  } catch (err) {
    console.error("Log recurring income error:", err);
    return NextResponse.json(
      { error: "Unable to log this income. Please try again." },
      { status: 500 }
    );
  }
}
