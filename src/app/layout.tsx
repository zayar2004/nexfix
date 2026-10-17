import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NEXFIX — Diagnose. Repair. Connect.",
    template: "%s | NEXFIX",
  },
  description: "Mobile-first arcade machine diagnostics and technician knowledge platform.",
  applicationName: "NEXFIX",
  authors: [{ name: "NEXFIX" }],
  creator: "NEXFIX",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
    { media: "(prefers-color-scheme: light)", color: "#F4F7FF" },
  ],
};

const DEFAULT_THEME = "dark";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="my" data-theme={DEFAULT_THEME} className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
