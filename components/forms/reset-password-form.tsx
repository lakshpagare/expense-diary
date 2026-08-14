"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { resetPasswordSchema } from "@/lib/validations";
import { z } from "zod";

type Input = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: Input) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Unable to reset password.");
        return;
      }
      toast.success("Password reset successfully. Please sign in.");
      router.push("/login");
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Invalid reset link</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is missing a token.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">Set a new password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a strong password you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <input type="hidden" {...register("token")} />
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" {...register("password")} error={!!errors.password} />
          <FormError message={errors.password?.message} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
          />
          <FormError message={errors.confirmPassword?.message} />
        </div>

        <FormError message={serverError ?? undefined} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
