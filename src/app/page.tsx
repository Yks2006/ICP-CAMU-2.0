import { AppShell } from "@/components/AppShell";
import { DashboardPage } from "@/components/pages/DashboardPage";

export default function Page() {
  return (
    <AppShell showFab>
      <DashboardPage />
    </AppShell>
  );
}
