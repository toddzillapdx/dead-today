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
  openGraph: {
    title: "Dead Today",
    description:
      "On this day in Grateful Dead history — explore concerts from the Internet Archive.",
    url: "https://www.toddames.com/dead-today/",
    siteName: "Dead Today",
    images: [
      {
        url: "https://dead-today-build.vercel.app/dead-today/dead-today-og.png",
        width: 1200,
        height: 630,
        alt: "Dead Today - Grateful Dead Concert Archive",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Today",
    description:
      "On this day in Grateful Dead history — explore concerts from the Internet Archive.",
    images: ["https://dead-today-build.vercel.app/dead-today/dead-today-og.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dead Today" />
        <meta name="theme-color" content="#1A1A1A" />
      </head>
      <body>
        <AudioProvider>
          {children}
          <PlayerContainer />
        </AudioProvider>
      </body>
    </html>
  );
}
