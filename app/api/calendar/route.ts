import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCalendarMonthTotals } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = Number(searchParams.get("year") ?? now.getFullYear());
    const month = Number(searchParams.get("month") ?? now.getMonth() + 1);

    const days = await getCalendarMonthTotals(session.userId, year, month);
    return NextResponse.json({ days });
  } catch (err) {
    console.error("Calendar totals error:", err);
    return NextResponse.json({ error: "Unable to load calendar." }, { status: 500 });
  }
}
