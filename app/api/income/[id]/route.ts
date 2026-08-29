import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Income from "@/models/Income";
import { getSession } from "@/lib/auth";
import { incomeSchema } from "@/lib/validations";

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
    return NextResponse.json({ error: "Income not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const income = await Income.findOne({ _id: id, userId: session.userId });
    if (!income) {
      return NextResponse.json({ error: "Income not found." }, { status: 404 });
    }
    return NextResponse.json({ income });
  } catch (err) {
    console.error("Get income error:", err);
    return NextResponse.json({ error: "Unable to load income." }, { status: 500 });
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
    return NextResponse.json({ error: "Income not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = incomeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();

    // Ownership enforced via the userId filter - a user can never edit
    // another user's income, even if they know the id.
    const income = await Income.findOneAndUpdate(
      { _id: id, userId: session.userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!income) {
      return NextResponse.json({ error: "Income not found." }, { status: 404 });
    }

    return NextResponse.json({ income });
  } catch (err) {
    console.error("Update income error:", err);
    return NextResponse.json(
      { error: "Unable to save income. Please try again." },
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
    return NextResponse.json({ error: "Income not found." }, { status: 404 });
  }

  try {
    await connectDB();
    const income = await Income.findOneAndDelete({ _id: id, userId: session.userId });
    if (!income) {
      return NextResponse.json({ error: "Income not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete income error:", err);
    return NextResponse.json(
      { error: "Unable to delete income. Please try again." },
      { status: 500 }
    );
  }
}
