import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getPendingSession } from "@/lib/auth";
import { generateOTP, hashOTP, otpExpiryDate } from "@/lib/otp";
import { sendVerificationOTP, sendLoginOTP } from "@/lib/email";

export async function POST() {
  try {
    const pending = await getPendingSession();
    if (!pending) {
      return NextResponse.json(
        { error: "No verification is pending. Please start again." },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(pending.userId);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const otp = generateOTP();
    user.otpCodeHash = hashOTP(otp);
    user.otpExpiresAt = otpExpiryDate();
    user.otpPurpose = pending.purpose;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    if (pending.purpose === "email_verification") {
      await sendVerificationOTP(user.email, user.name, otp);
    } else {
      await sendLoginOTP(user.email, user.name, otp);
    }

    return NextResponse.json({ message: "A new code has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      { error: "Unable to resend code. Please try again." },
      { status: 500 }
    );
  }
}
