import { Suspense } from "react";
import { ActivateAccountForm } from "@/components/ActivateAccountForm";
import { LoginHero } from "@/components/LoginHero";
import { MaterialIcon } from "@/components/MaterialIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Set Password | CAMU 2.0 Student Portal",
  description: "Set your password for the CAMU 2.0 student portal.",
};

export default function ActivateAccountPage() {
  return (
    <div className="bg-bg-app text-on-surface flex min-h-screen">
      <LoginHero />

      <section className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <Card className="custom-shadow w-full max-w-md border-outline-variant bg-surface-light py-8 ring-0">
          <CardHeader className="space-y-3 px-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary-container text-primary">
              <MaterialIcon icon="key" className="text-3xl" />
            </div>
            <CardTitle className="text-headline-md font-headline-md text-primary">
              Set your password
            </CardTitle>
            <CardDescription className="text-body-md text-on-surface-variant">
              Use your student email to create a password before signing in.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8">
            <Suspense
              fallback={
                <div className="py-8 text-center text-body-sm text-on-surface-variant">
                  Loading...
                </div>
              }
            >
              <ActivateAccountForm />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
