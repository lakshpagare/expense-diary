import crypto from "crypto";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

export function generateOTP(): string {
  // Cryptographically random 6-digit code, zero-padded.
  const num = crypto.randomInt(0, 10 ** OTP_LENGTH);
  return String(num).padStart(OTP_LENGTH, "0");
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function otpExpiryDate(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + OTP_EXPIRY_MINUTES);
  return d;
}
