import { LoginFormSection } from "@/components/LoginFormSection";
import { LoginHero } from "@/components/LoginHero";

export const metadata = {
  title: "Login | CAMU 2.0 Student Portal",
  description: "Sign in to the CAMU 2.0 student portal with your university email.",
};

export default function LoginPage() {
  return (
    <div className="bg-bg-app text-on-surface flex min-h-screen">
      <LoginHero />
      <LoginFormSection />
    </div>
  );
}
