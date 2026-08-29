import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDayDetails } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const details = await getDayDetails(session.userId, date);
    return NextResponse.json(details);
  } catch (err) {
    console.error("Day details error:", err);
    return NextResponse.json({ error: "Unable to load day details." }, { status: 500 });
  }
}
