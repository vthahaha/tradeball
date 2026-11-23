import type { Metadata } from "next";
import { Anybody, Archivo, Bodoni_Moda, Mr_Dafoe } from "next/font/google";
import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/session";
import { pendingIncomingCount } from "@/lib/trades";
import "./globals.css";

// Ticket print: a wide variable grotesk for display, a plain grotesk for everything else.
// Both are variable on width, so condensed labels are the same family at a narrower stretch.
const display = Anybody({ variable: "--font-display", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
const body = Archivo({ variable: "--font-body", subsets: ["latin", "latin-ext"], axes: ["wdth"] });
// Marker-style signature, for the autograph on Hard Goodbyes cards.
const sign = Mr_Dafoe({ variable: "--font-sign", subsets: ["latin", "latin-ext"], weight: "400" });
// Engraved-plate numerals, for the Finals year on Best of the Best cards.
const engrave = Bodoni_Moda({ variable: "--font-engrave", subsets: ["latin"], style: "italic", weight: "700" });

export const metadata: Metadata = {
  title: "Gate 7",
  description: "Open free basketball, Champions League and NFL card packs from this season’s squads and trade with friends.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const pendingTrades = user ? await pendingIncomingCount(user.id) : 0;
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${sign.variable} ${engrave.variable} h-full antialiased`}>
      <head>
        {/* Only the twelve zodiac characters on Lunar New Year seals (text= subsets the font) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout: loads on every page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@900&display=swap&text=%E9%BC%A0%E7%89%9B%E8%99%8E%E8%B2%93%E9%BE%8D%E8%9B%87%E9%A6%AC%E7%BE%8A%E7%8C%B4%E9%9B%9E%E7%8B%97%E8%B1%AC"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Nav username={user?.username ?? null} pendingTrades={pendingTrades} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:pb-16">{children}</main>
      </body>
    </html>
  );
}
