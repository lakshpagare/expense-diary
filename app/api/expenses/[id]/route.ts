import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import { getSession } from "@/lib/auth";
import { expenseSchema } from "@/lib/validations";

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const expense = await Expense.findOne({ _id: id, userId: session.userId });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }
    return NextResponse.json({ expense });
  } catch (err) {
    console.error("Get expense error:", err);
    return NextResponse.json({ error: "Unable to load expense." }, { status: 500 });
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
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    // Ownership enforced via the userId filter - a user can never edit
    // another user's expense, even if they know the id.
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }

    return NextResponse.json({ expense });
  } catch (err) {
    console.error("Update expense error:", err);
    return NextResponse.json(
      { error: "Unable to save expense. Please try again." },
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
  if (!isValidId(id)) {
    return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const expense = await Expense.findOneAndDelete({ _id: id, userId: session.userId });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete expense error:", err);
    return NextResponse.json(
      { error: "Unable to delete expense. Please try again." },
      { status: 500 }
    );
  }
}
