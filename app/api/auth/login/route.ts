import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { setPendingCookie, setSessionCookie } from "@/lib/auth";
import { generateOTP, hashOTP, otpExpiryDate } from "@/lib/otp";
import { sendLoginOTP } from "@/lib/email";
import { ENABLE_LOGIN_OTP } from "@/lib/feature-flags";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;

    await connectDB();

    const query = EMAIL_REGEX.test(identifier)
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await User.findOne(query).select("+password");

    // Use a generic error to avoid leaking whether the account exists
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { error: "Invalid email/phone number or password." },
        { status: 401 }
      );
    }

    if (!ENABLE_LOGIN_OTP) {
      await setSessionCookie({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });
      return NextResponse.json({
        requiresVerification: false,
        user: { id: user._id.toString(), name: user.name, email: user.email },
      });
    }

    const otp = generateOTP();
    user.otpCodeHash = hashOTP(otp);
    user.otpExpiresAt = otpExpiryDate();
    user.otpPurpose = "login";
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    await sendLoginOTP(user.email, user.name, otp);

    await setPendingCookie({ userId: user._id.toString(), purpose: "login" });

    return NextResponse.json({ requiresVerification: true, email: user.email });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Unable to log in. Please try again." },
      { status: 500 }
    );
  }
}
