import { Suspense } from "react";
import { AuthFormPanel } from "@/components/AuthFormPanel";
import { LoginForm } from "@/components/LoginForm";

export function LoginFormSection() {
  return (
    <AuthFormPanel
      icon="school"
      title="Welcome back"
      description="Sign in with your student email and password to access CAMU 2.0."
    >
      <Suspense
        fallback={
          <div className="py-8 text-center text-body-sm text-on-surface-variant">Loading...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthFormPanel>
  );
}
