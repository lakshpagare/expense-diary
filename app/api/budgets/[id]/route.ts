import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
import { getSession } from "@/lib/auth";
import { budgetSchema } from "@/lib/validations";

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
    return NextResponse.json({ error: "Budget not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const budget = await Budget.findOne({ _id: id, userId: session.userId }).lean();
    if (!budget) {
      return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    return NextResponse.json({ budget });
  } catch (err) {
    console.error("Get budget error:", err);
    return NextResponse.json({ error: "Unable to load budget." }, { status: 500 });
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
    return NextResponse.json({ error: "Budget not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    if (!budget) {
      return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    return NextResponse.json({ budget });
  } catch (err) {
    console.error("Update budget error:", err);
    return NextResponse.json({ error: "Unable to update budget." }, { status: 500 });
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
    return NextResponse.json({ error: "Budget not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const budget = await Budget.findOneAndDelete({ _id: id, userId: session.userId });
    if (!budget) {
      return NextResponse.json({ error: "Budget not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete budget error:", err);
    return NextResponse.json({ error: "Unable to delete budget." }, { status: 500 });
  }
}
