import type { Metadata } from "next";
import { Anybody, Archivo, Press_Start_2P, Yellowtail } from "next/font/google";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";
import { pendingIncomingCount } from "@/lib/trades";
import "./globals.css";

// Ticket print: a wide variable grotesk for display, a plain grotesk for everything else.
// Both are variable on width, so condensed labels are the same family at a narrower stretch.
const display = Anybody({ variable: "--font-display", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
const body = Archivo({ variable: "--font-body", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
// Card lettering: a retro script for team names and set logos, a pixel face for the 8-bit set.
const script = Yellowtail({ variable: "--font-script", subsets: ["latin"], weight: "400" });
const pixel = Press_Start_2P({ variable: "--font-pixel", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Gate 7",
  description: "Open free basketball card packs from this season’s rosters and trade with friends.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const pendingTrades = user ? await pendingIncomingCount(user.id) : 0;
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable} ${pixel.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Nav username={user?.username ?? null} pendingTrades={pendingTrades} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:pb-16">{children}</main>
      </body>
    </html>
  );
}
