export const STAGES = [
  { name: "Lead", order: 0, color: "#8a8f98" },
  { name: "Discovery", order: 1, color: "#3b82f6" },
  { name: "Demo", order: 2, color: "#8b5cf6" },
  { name: "Proposal", order: 3, color: "#d97706" },
  { name: "Negotiation", order: 4, color: "#ea580c" },
  { name: "Closed Won", order: 5, color: "#16a34a" },
  { name: "Closed Lost", order: 6, color: "#dc2626" },
] as const;

export type Stage = (typeof STAGES)[number]["name"];
export const STAGE_NAMES = STAGES.map((s) => s.name) as [Stage, ...Stage[]];
