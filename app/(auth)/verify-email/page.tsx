import { OtpForm } from "@/components/forms/otp-form";

export default function VerifyEmailPage() {
  return (
    <OtpForm
      purpose="email_verification"
      verifyUrl="/api/auth/verify-email"
      successMessage="Email verified. Welcome to Expenses and Incomes Trackers!"
      heading="Verify your email"
      subheading="We've sent a 6-digit code to your email address. Enter it below to activate your account."
    />
  );
}
