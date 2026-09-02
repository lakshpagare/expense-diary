import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import RecurringIncome from "@/models/RecurringIncome";
import { getSession } from "@/lib/auth";
import { recurringIncomeSchema } from "@/lib/validations";
import { computeNextDueDate } from "@/lib/recurring";

export async function PUT(
  req: NextRequest,
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
    const body = await req.json();
    const parsed = recurringIncomeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await RecurringIncome.findOne({ _id: id, userId: session.userId });
    if (!existing) {
      return NextResponse.json({ error: "Recurring income not found." }, { status: 404 });
    }

    const startDateChanged = existing.startDate !== parsed.data.startDate;
    const frequencyChanged = existing.frequency !== parsed.data.frequency;
    const nextIncomeDate =
      startDateChanged || frequencyChanged
        ? computeNextDueDate(parsed.data.startDate, parsed.data.frequency)
        : existing.nextIncomeDate;

    const item = await RecurringIncome.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: { ...parsed.data, nextIncomeDate } },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ item });
  } catch (err) {
    console.error("Update recurring income error:", err);
    return NextResponse.json(
      { error: "Unable to update recurring income." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
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
    const item = await RecurringIncome.findOneAndDelete({ _id: id, userId: session.userId });
    if (!item) {
      return NextResponse.json({ error: "Recurring income not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete recurring income error:", err);
    return NextResponse.json(
      { error: "Unable to delete recurring income." },
      { status: 500 }
    );
  }
}
