"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { loginSchema, type LoginInput } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Invalid email/phone number or password.");
        return;
      }
      if (json.requiresVerification) {
        toast.success("Code sent to your email.");
        router.push("/verify-login");
      } else {
        toast.success("Login successful");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setServerError("Unable to connect to server. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to see your spending overview.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="identifier">Email or Phone Number</Label>
          <Input
            id="identifier"
            placeholder="you@example.com or 9876543210"
            {...register("identifier")}
            error={!!errors.identifier}
          />
          <FormError message={errors.identifier?.message} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="mb-1.5 text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={!!errors.password}
          />
          <FormError message={errors.password?.message} />
        </div>

        <FormError message={serverError ?? undefined} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
