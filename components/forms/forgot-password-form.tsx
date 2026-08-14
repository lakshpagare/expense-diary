"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { forgotPasswordSchema } from "@/lib/validations";
import { z } from "zod";

type Input = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: Input) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Unable to process request.");
        return;
      }
      setSent(true);
      if (json.devResetToken) setDevToken(json.devResetToken);
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <h2 className="mt-4 text-xl font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a password
          reset link.
        </p>
        {devToken && (
          <div className="mt-4 rounded-xl border border-border bg-muted p-3 text-left text-xs">
            <p className="font-medium text-foreground">Dev mode — no email provider configured:</p>
            <Link
              href={`/reset-password?token=${devToken}`}
              className="mt-1 block break-all text-brand hover:underline"
            >
              /reset-password?token={devToken}
            </Link>
          </div>
        )}
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">Forgot your password?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={!!errors.email}
          />
          <FormError message={errors.email?.message} />
        </div>

        <FormError message={serverError ?? undefined} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
