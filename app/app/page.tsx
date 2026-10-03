import { Brief } from "../../components/app/Brief";
import { appData } from "../../lib/app-data";

export const metadata = { title: "Brief" };

export default function BriefPage() {
  const { deals, activities } = appData();
  // A deal needs a reply when the newest thing on it is an email from the buyer.
  const needsReply = deals
    .filter((d) => {
      const last = activities.filter((a) => a.dealId === d.id).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
      return last?.kind === "email" && !last.from.includes(d.ownerName);
    })
    .map((d) => d.id);
  return <Brief needsReply={needsReply} activityCount={activities.length} />;
}
