import { Resend } from "resend";
import { OTP_EXPIRY_MINUTES } from "@/lib/otp";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function otpEmailHtml(name: string, otp: string, heading: string, bodyLine: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom: 24px;">
      <div style="width:28px;height:28px;border-radius:8px;background:#059669;"></div>
      <span style="font-size:16px; font-weight:600;">Expense Diary</span>
    </div>
    <h2 style="font-size: 18px; margin: 0 0 8px;">${heading}</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.5;">Hi ${name}, ${bodyLine}</p>
    <div style="margin: 24px 0; text-align: center;">
      <span style="display:inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #059669; background: #d1fae5; padding: 16px 24px; border-radius: 12px;">${otp}</span>
    </div>
    <p style="font-size: 13px; color: #64748b;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || "Expense Diary <onboarding@resend.dev>";

export async function sendVerificationOTP(to: string, name: string, otp: string) {
  const resend = getClient();
  if (!resend) {
    console.warn(`RESEND_API_KEY not set - verification OTP for ${to}: ${otp}`);
    return;
  }
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Verify your email - Expense Diary",
    html: otpEmailHtml(
      name,
      otp,
      "Verify your email address",
      "use the code below to verify your email and activate your account."
    ),
  });
}

export async function sendLoginOTP(to: string, name: string, otp: string) {
  const resend = getClient();
  if (!resend) {
    console.warn(`RESEND_API_KEY not set - login OTP for ${to}: ${otp}`);
    return;
  }
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your login code - Expense Diary",
    html: otpEmailHtml(
      name,
      otp,
      "Confirm it's you",
      "use the code below to finish signing in to your account."
    ),
  });
}
