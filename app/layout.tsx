import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bonjour",
  description: "A CRM agent that proposes deal updates from emails and call notes, with a cited quote for every change.",
  referrer: "no-referrer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
