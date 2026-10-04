import { Brief } from "../../components/app/Brief";
import { needsReply } from "../../components/morning";
import { appData } from "../../lib/app-data";

export const metadata = { title: "Brief" };

export default function BriefPage() {
  const { deals, activities } = appData();
  return <Brief needsReply={needsReply(deals, activities)} activityCount={activities.length} />;
}
