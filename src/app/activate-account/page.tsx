import { Suspense } from "react";
import { ActivateAccountForm } from "@/components/ActivateAccountForm";
import { AuthFormPanel } from "@/components/AuthFormPanel";
import { LoginHero } from "@/components/LoginHero";

export const metadata = {
  title: "Set Password | CAMU 2.0 Student Portal",
  description: "Set your password for the CAMU 2.0 student portal.",
};

export default function ActivateAccountPage() {
  return (
    <div className="bg-bg-app text-on-surface flex min-h-screen">
      <LoginHero />

      <AuthFormPanel
        icon="key"
        title="Set your password"
        description="Use your student email to create a password before signing in."
      >
        <Suspense
          fallback={
            <div className="py-8 text-center text-body-sm text-on-surface-variant">Loading...</div>
          }
        >
          <ActivateAccountForm />
        </Suspense>
      </AuthFormPanel>
    </div>
  );
}
