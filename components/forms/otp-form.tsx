"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";

const RESEND_COOLDOWN_SECONDS = 30;

interface OtpFormProps {
  purpose: "email_verification" | "login";
  verifyUrl: string;
  successMessage: string;
  heading: string;
  subheading: string;
}

export function OtpForm({ purpose, verifyUrl, successMessage, heading, subheading }: OtpFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Unable to verify code.");
        return;
      }

      toast.success(successMessage);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Unable to resend code.");
        return;
      }

      toast.success("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light">
        <MailCheck className="h-6 w-6 text-brand" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">{heading}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{subheading}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        <Input
          ref={inputRef}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          maxLength={6}
          className="text-center text-2xl font-semibold tracking-[0.5em]"
          error={!!error}
        />
        <FormError message={error ?? undefined} />

        <Button type="submit" className="w-full" loading={submitting}>
          Verify {purpose === "login" ? "& Sign In" : "Email"}
        </Button>
      </form>

      <p className="mt-5 text-sm text-muted-foreground">
        Didn&apos;t get the code?{" "}
        {cooldown > 0 ? (
          <span>Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-medium text-brand hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        )}
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
