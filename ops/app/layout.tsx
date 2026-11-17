import type { Metadata } from "next";
import "./styles.css";
import "./agent-characters.css";
import "./island-workshop.css";
import "./cartoonland.css";

export const metadata: Metadata = {
  title: "Wicked Roots Ops — Cartoonland",
  description: "Explore a cheerful island workspace for Wicked Roots Landscape.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
