import { DemoProvider } from "../../components/app/DemoState";
import { Shell } from "../../components/app/Shell";
import { appData } from "../../lib/app-data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { deals, contacts, companies, runs } = appData();
  return (
    <DemoProvider data={{ deals, contacts, companies, runs }}>
      <Shell>{children}</Shell>
    </DemoProvider>
  );
}
