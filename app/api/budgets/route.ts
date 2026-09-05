import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
import { getSession } from "@/lib/auth";
import { budgetSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
    const year = Number(searchParams.get("year") ?? now.getFullYear());

    const budget = await Budget.findOne({ userId: session.userId, month, year }).lean();

    return NextResponse.json({ budget });
  } catch (err) {
    console.error("Get budget error:", err);
    return NextResponse.json({ error: "Unable to load budget." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
      { userId: session.userId, month: parsed.data.month, year: parsed.data.year },
      { $set: { amount: parsed.data.amount } },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ budget }, { status: 201 });
  } catch (err) {
    console.error("Save budget error:", err);
    return NextResponse.json(
      { error: "Unable to save budget. Please try again." },
      { status: 500 }
    );
  }
}
