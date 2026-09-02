import { OtpForm } from "@/components/forms/otp-form";

export default function VerifyLoginPage() {
  return (
    <OtpForm
      purpose="login"
      verifyUrl="/api/auth/verify-login"
      successMessage="Login successful"
      heading="Confirm it's you"
      subheading="We've sent a 6-digit code to your email address. Enter it below to finish signing in."
    />
  );
}
