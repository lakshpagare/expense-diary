import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import RecurringExpense from "@/models/RecurringExpense";
import { getSession } from "@/lib/auth";
import { recurringExpenseSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
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
    const recurring = await RecurringExpense.findOne({
      _id: id,
      userId: session.userId,
    }).lean();

    if (!recurring) {
      return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
    }

    return NextResponse.json({ recurring });
  } catch (err) {
    console.error("Get recurring expense error:", err);
    return NextResponse.json(
      { error: "Unable to load recurring expense." },
      { status: 500 }
    );
  }
}

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
    return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = recurringExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    const recurring = await RecurringExpense.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!recurring) {
      return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
    }

    return NextResponse.json({ recurring });
  } catch (err) {
    console.error("Update recurring expense error:", err);
    return NextResponse.json(
      { error: "Unable to update recurring expense." },
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
    return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const recurring = await RecurringExpense.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!recurring) {
      return NextResponse.json({ error: "Recurring expense not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete recurring expense error:", err);
    return NextResponse.json(
      { error: "Unable to delete recurring expense." },
      { status: 500 }
    );
  }
}
