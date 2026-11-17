@import "./agent-characters.css";
import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Wicked Roots Ops",
  description: "Private lead and outreach workspace for Wicked Roots Landscape.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
