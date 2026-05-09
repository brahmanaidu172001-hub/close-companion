import { AppShell } from "@/components/close-companion/app-shell";
import { Dashboard } from "@/components/close-companion/dashboard";
import { sampleSnapshot } from "@/lib/mock-data";

export const dynamic = "force-static";

export default function DashboardPage() {
  return (
    <AppShell>
      <Dashboard snapshot={sampleSnapshot} />
    </AppShell>
  );
}
