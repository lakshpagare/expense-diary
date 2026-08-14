import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RecurringExpense from "@/models/RecurringExpense";
import { getSession } from "@/lib/auth";
import { recurringExpenseSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();
    const recurring = await RecurringExpense.find({ userId: session.userId })
      .sort({ nextDueDate: 1 })
      .lean();
    return NextResponse.json({ recurring });
  } catch (err) {
    console.error("List recurring expenses error:", err);
    return NextResponse.json(
      { error: "Unable to load recurring expenses." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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

    const recurring = await RecurringExpense.create({
      ...parsed.data,
      userId: session.userId,
      nextDueDate: parsed.data.startDate,
    });

    return NextResponse.json({ recurring }, { status: 201 });
  } catch (err) {
    console.error("Create recurring expense error:", err);
    return NextResponse.json(
      { error: "Unable to create recurring expense. Please try again." },
      { status: 500 }
    );
  }
}
