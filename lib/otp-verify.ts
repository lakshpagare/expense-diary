import User, { IUser } from "@/models/User";
import { hashOTP, MAX_OTP_ATTEMPTS } from "@/lib/otp";
import type { PendingPayload } from "@/lib/auth";

export interface OtpCheckResult {
  ok: boolean;
  error?: string;
  status?: number;
  user?: IUser;
}

export async function checkAndConsumeOtp(
  pending: PendingPayload,
  otp: string
): Promise<OtpCheckResult> {
  const user = await User.findById(pending.userId).select(
    "+otpCodeHash +otpExpiresAt +otpPurpose +otpAttempts"
  );

  if (!user) {
    return { ok: false, error: "Account not found.", status: 404 };
  }

  if (
    !user.otpCodeHash ||
    !user.otpExpiresAt ||
    user.otpPurpose !== pending.purpose
  ) {
    return {
      ok: false,
      error: "No verification is pending. Please start again.",
      status: 400,
    };
  }

  if ((user.otpAttempts ?? 0) >= MAX_OTP_ATTEMPTS) {
    return {
      ok: false,
      error: "Too many incorrect attempts. Please request a new code.",
      status: 429,
    };
  }

  if (user.otpExpiresAt < new Date()) {
    return {
      ok: false,
      error: "This code has expired. Please request a new one.",
      status: 400,
    };
  }

  if (hashOTP(otp) !== user.otpCodeHash) {
    user.otpAttempts = (user.otpAttempts ?? 0) + 1;
    await user.save({ validateBeforeSave: false });
    return { ok: false, error: "Incorrect code. Please try again.", status: 400 };
  }

  // Success - clear the OTP so it can't be reused.
  user.otpCodeHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpPurpose = undefined;
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  return { ok: true, user };
}
