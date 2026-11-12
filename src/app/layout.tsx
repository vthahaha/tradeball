import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Bebas_Neue } from "next/font/google";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";
import { pendingIncomingCount } from "@/lib/trades";
import "./globals.css";

const display = Bebas_Neue({ variable: "--font-display", weight: "400", subsets: ["latin", "latin-ext"] });
const body = Barlow({ variable: "--font-body", weight: ["400", "500", "600", "700"], subsets: ["latin", "latin-ext"] });
const cond = Barlow_Condensed({
  variable: "--font-cond",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "TradeBall",
  description: "Open free soccer & basketball card packs and trade with friends.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const pendingTrades = user ? await pendingIncomingCount(user.id) : 0;
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${cond.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Nav username={user?.username ?? null} pendingTrades={pendingTrades} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:pb-16">{children}</main>
      </body>
    </html>
  );
}
