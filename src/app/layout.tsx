import type { Metadata } from "next";
import { Anybody, Archivo } from "next/font/google";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";
import { pendingIncomingCount } from "@/lib/trades";
import "./globals.css";

// Ticket print: a wide variable grotesk for display, a plain grotesk for everything else.
// Both are variable on width, so condensed labels are the same family at a narrower stretch.
const display = Anybody({ variable: "--font-display", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
const body = Archivo({ variable: "--font-body", subsets: ["latin", "latin-ext"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "TradeBall",
  description: "Open free soccer & basketball card packs and trade with friends.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const pendingTrades = user ? await pendingIncomingCount(user.id) : 0;
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Nav username={user?.username ?? null} pendingTrades={pendingTrades} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:pb-16">{children}</main>
      </body>
    </html>
  );
}
