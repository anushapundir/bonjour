import { AddressBook, Buildings, ChartBar, Handshake, Kanban, SunHorizon } from "@phosphor-icons/react/dist/ssr";
import { HUES } from "./ui";

// The app sidebar, grouped. The landing page draws the same list inside its product window.
export const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/app", label: "Brief", icon: SunHorizon, color: HUES.amber },
      { href: "/app/pipeline", label: "Pipeline", icon: Kanban, color: HUES.violet },
      { href: "/app/deals", label: "Deals", icon: Handshake, color: HUES.blue },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/app/contacts", label: "Contacts", icon: AddressBook, color: HUES.pink },
      { href: "/app/companies", label: "Companies", icon: Buildings, color: HUES.teal },
    ],
  },
  {
    label: "Quality",
    items: [{ href: "/app/eval", label: "Eval", icon: ChartBar, color: HUES.green }],
  },
];
