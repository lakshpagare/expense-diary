import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

    // Always return success to avoid leaking which emails are registered
    if (!user) {
      return NextResponse.json({
        message: "If an account exists for that email, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // In production this token would be emailed via a transactional email
    // provider (e.g. Resend, SendGrid). For local/demo use we log it.
    console.log(`Password reset token for ${user.email}: ${token}`);

    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
      // Exposed only to make the demo usable without an email provider configured.
      devResetToken: process.env.NODE_ENV !== "production" ? token : undefined,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
