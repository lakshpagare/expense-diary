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
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const query: Record<string, unknown> = { userId: session.userId };
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);

    const budgets = await Budget.find(query).sort({ year: -1, month: -1 }).lean();
    return NextResponse.json({ budgets });
  } catch (err) {
    console.error("List budgets error:", err);
    return NextResponse.json({ error: "Unable to load budgets." }, { status: 500 });
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

    const existing = await Budget.findOne({
      userId: session.userId,
      year: parsed.data.year,
      month: parsed.data.month,
    });

    if (existing) {
      existing.amount = parsed.data.amount;
      await existing.save();
      return NextResponse.json({ budget: existing });
    }

    const budget = await Budget.create({
      ...parsed.data,
      userId: session.userId,
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (err) {
    console.error("Create budget error:", err);
    return NextResponse.json(
      { error: "Unable to save budget. Please try again." },
      { status: 500 }
    );
  }
}
