import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Category from "@/models/Category";
import { registerSchema } from "@/lib/validations";
import { setPendingCookie, setSessionCookie } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/types";
import { newTrialEndDate } from "@/lib/subscription";
import { isDisposableEmail } from "@/lib/disposable-email-domains";
import { generateOTP, hashOTP, otpExpiryDate } from "@/lib/otp";
import { sendVerificationOTP } from "@/lib/email";
import { ENABLE_LOGIN_OTP } from "@/lib/feature-flags";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = parsed.data;

    // Kept active regardless of the OTP flag - this is a real email format/
    // domain check, not part of the OTP verification flow, so it should
    // always reject obviously-fake addresses.
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Please use a real, permanent email address. Temporary/disposable emails are not allowed.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { error: "An account with this phone number already exists." },
        { status: 409 }
      );
    }

    let user;

    if (ENABLE_LOGIN_OTP) {
      const otp = generateOTP();
      user = await User.create({
        name,
        email,
        phone,
        password,
        trialEndsAt: newTrialEndDate(),
        subscriptionStatus: "trial",
        emailVerified: false,
        otpCodeHash: hashOTP(otp),
        otpExpiresAt: otpExpiryDate(),
        otpPurpose: "email_verification",
        otpAttempts: 0,
      });
      await sendVerificationOTP(user.email, user.name, otp);
    } else {
      user = await User.create({
        name,
        email,
        phone,
        password,
        trialEndsAt: newTrialEndDate(),
        subscriptionStatus: "trial",
        emailVerified: true,
      });
    }

    // Seed default categories for the new user
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({
        userId: user._id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        isDefault: true,
      }))
    );

    if (ENABLE_LOGIN_OTP) {
      // Pending session only - full login happens after OTP verification.
      await setPendingCookie({ userId: user._id.toString(), purpose: "email_verification" });
      return NextResponse.json(
        { requiresVerification: true, email: user.email },
        { status: 201 }
      );
    }

    await setSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return NextResponse.json(
      {
        requiresVerification: false,
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
