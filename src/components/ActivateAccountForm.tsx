"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { PasswordRequirementsHint } from "@/components/PasswordRequirementsHint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validateActivateAccountForm,
  validatePassword,
  validateStudentEmail,
} from "@/lib/auth-validation";

export function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateActivateAccountForm(email, password, confirmPassword);
    setEmailError(errors.email);
    setPasswordError(errors.password);
    setConfirmPasswordError(errors.confirmPassword);

    if (errors.email || errors.password || errors.confirmPassword) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        errors?: {
          email?: string;
          password?: string;
          confirmPassword?: string;
        };
      };

      if (!response.ok) {
        setEmailError(data.errors?.email);
        setPasswordError(data.errors?.password);
        setConfirmPasswordError(data.errors?.confirmPassword);
        return;
      }

      router.push("/login?activated=1");
    } catch {
      setPasswordError("Unable to set password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-label-md font-label-md text-on-surface">
          Student Email
        </Label>
        <div className="relative">
          <MaterialIcon
            icon="mail"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@student.uow.edu.my"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailError(validateStudentEmail(email))}
            aria-invalid={Boolean(emailError)}
            className="h-11 border-outline-variant bg-surface-container-low pl-10 text-body-md focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>
        {emailError && (
          <p className="text-label-sm text-error" role="alert">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="password" className="text-label-md font-label-md text-on-surface">
            New Password
          </Label>
          <PasswordRequirementsHint password={password} />
        </div>
        <div className="relative">
          <MaterialIcon
            icon="lock"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => setPasswordError(validatePassword(password))}
            aria-invalid={Boolean(passwordError)}
            maxLength={12}
            className="h-11 border-outline-variant bg-surface-container-low pl-10 text-body-md focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>
        {passwordError && (
          <p className="text-label-sm text-error" role="alert">
            {passwordError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-label-md font-label-md text-on-surface">
          Confirm Password
        </Label>
        <div className="relative">
          <MaterialIcon
            icon="lock"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() =>
              setConfirmPasswordError(
                !confirmPassword
                  ? "Please confirm your password."
                  : password !== confirmPassword
                    ? "Passwords do not match."
                    : undefined,
              )
            }
            aria-invalid={Boolean(confirmPasswordError)}
            maxLength={12}
            className="h-11 border-outline-variant bg-surface-container-low pl-10 text-body-md focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>
        {confirmPasswordError && (
          <p className="text-label-sm text-error" role="alert">
            {confirmPasswordError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full border-none bg-[#00346d] text-sm font-semibold text-white shadow-sm hover:bg-[#124687] disabled:opacity-60"
      >
        {isSubmitting ? "Saving password..." : "Set Password"}
      </Button>

      <p className="text-center text-body-sm text-on-surface-variant">
        Already have a password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
