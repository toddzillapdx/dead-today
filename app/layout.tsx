import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/AudioProvider";
import { PlayerContainer } from "@/components/PlayerContainer";

// Display + UI typefaces (Design System v0.2 §3.1).
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dead Today",
  description:
    "On this day in Grateful Dead history — explore concerts from the Internet Archive.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body>
        <AudioProvider>
          {children}
          <PlayerContainer />
        </AudioProvider>
      </body>
    </html>
  );
}
