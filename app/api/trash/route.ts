import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Expense from "@/models/Expense";
import Income from "@/models/Income";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await connectDB();

    const [expenses, income] = await Promise.all([
      Expense.find({ userId: session.userId, isDeleted: true })
        .sort({ deletedAt: -1 })
        .limit(200)
        .lean(),
      Income.find({ userId: session.userId, isDeleted: true })
        .sort({ deletedAt: -1 })
        .limit(200)
        .lean(),
    ]);

    const items = [
      ...expenses.map((e) => ({ ...e, transactionType: "expense" as const })),
      ...income.map((i) => ({ ...i, transactionType: "income" as const })),
    ].sort((a, b) => {
      const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
      const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("List trash error:", err);
    return NextResponse.json({ error: "Unable to load Trash." }, { status: 500 });
  }
}
