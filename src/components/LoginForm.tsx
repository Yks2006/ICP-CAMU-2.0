"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { PasswordRequirementsHint } from "@/components/PasswordRequirementsHint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  validateLoginForm,
  validatePassword,
  validateStudentEmail,
} from "@/lib/auth-validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailBlur = () => {
    setEmailError(validateStudentEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateLoginForm(email, password);
    setEmailError(errors.email);
    setPasswordError(errors.password);

    if (errors.email || errors.password) {
      return;
    }

    setIsSubmitting(true);
    let loginSucceeded = false;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      let data: {
        ok: boolean;
        requiresPasswordSetup?: boolean;
        user?: { role?: "admin" | "student" };
        errors?: { email?: string; password?: string };
      } = {
        ok: false,
      };

      try {
        data = (await response.json()) as typeof data;
      } catch {
        setPasswordError("Unable to sign in. Please try again.");
        return;
      }

      if (!response.ok) {
        if (data.requiresPasswordSetup) {
          router.push(`/activate-account?email=${encodeURIComponent(email.trim())}`);
          return;
        }

        setEmailError(data.errors?.email);
        setPasswordError(data.errors?.password ?? "Unable to sign in. Please check your details.");
        return;
      }

      loginSucceeded = true;

      const redirectTo = searchParams.get("from");
      const defaultDestination =
        data.user?.role === "admin" ? "/admin/register-student" : "/";
      const destination =
        redirectTo &&
        redirectTo !== "/login" &&
        redirectTo.startsWith("/") &&
        (data.user?.role !== "admin" || redirectTo.startsWith("/admin"))
          ? redirectTo
          : defaultDestination;

      window.location.assign(destination);
    } catch {
      setPasswordError("Unable to sign in. Please try again.");
    } finally {
      if (!loginSucceeded) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {searchParams.get("activated") === "1" && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-label-sm text-success">
          Password set successfully. You can now sign in.
        </div>
      )}
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
            onBlur={handleEmailBlur}
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
            Password
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={handlePasswordBlur}
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

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="default"
        className="h-11 w-full border-none bg-[#00346d] text-sm font-semibold text-white shadow-sm hover:bg-[#124687] disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-body-sm text-on-surface-variant">
        First time here?{" "}
        <Link href="/activate-account" className="font-semibold text-primary hover:underline">
          Set your password
        </Link>
      </p>
    </form>
  );
}
