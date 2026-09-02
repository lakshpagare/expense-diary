import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { otpSchema } from "@/lib/validations";
import { getPendingSession, clearPendingCookie, setSessionCookie } from "@/lib/auth";
import { checkAndConsumeOtp } from "@/lib/otp-verify";

export async function POST(req: NextRequest) {
  try {
    const pending = await getPendingSession();
    if (!pending || pending.purpose !== "login") {
      return NextResponse.json(
        { error: "No login is pending. Please sign in again." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid code" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await checkAndConsumeOtp(pending, parsed.data.otp);
    if (!result.ok || !result.user) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
    }

    await clearPendingCookie();
    await setSessionCookie({
      userId: result.user._id.toString(),
      email: result.user.email,
      name: result.user.name,
    });

    return NextResponse.json({
      user: {
        id: result.user._id.toString(),
        name: result.user.name,
        email: result.user.email,
      },
    });
  } catch (err) {
    console.error("Verify login error:", err);
    return NextResponse.json(
      { error: "Unable to verify code. Please try again." },
      { status: 500 }
    );
  }
}
