import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RecurringIncome from "@/models/RecurringIncome";
import { getSession } from "@/lib/auth";
import { recurringIncomeSchema } from "@/lib/validations";
import { computeNextDueDate } from "@/lib/recurring";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const items = await RecurringIncome.find({ userId: session.userId }).sort({
      nextIncomeDate: 1,
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("List recurring income error:", err);
    return NextResponse.json({ error: "Unable to load recurring income." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

    const item = await RecurringIncome.create({
      ...parsed.data,
      active: parsed.data.active ?? true,
      nextIncomeDate: computeNextDueDate(parsed.data.startDate, parsed.data.frequency),
      userId: session.userId,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("Create recurring income error:", err);
    return NextResponse.json(
      { error: "Unable to save recurring income. Please try again." },
      { status: 500 }
    );
  }
}
