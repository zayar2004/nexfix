import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NetworkProvider } from "@/lib/network-context";
import { SettingsProvider } from "@/lib/settings-context";
import { SessionProvider } from "next-auth/react";
import { UserBackButton } from "@/components/layout/UserBackButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NEXFIX - Arcade Diagnostics",
  description: "Diagnose. Repair. Connect.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXFIX",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B1020",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my" suppressHydrationWarning>
      <head>
        {/* This script runs BEFORE the page renders to apply theme from localStorage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nexfix-theme') || 'dark';
                  var root = document.documentElement;
                  
                  // Remove all theme classes
                  root.classList.remove('nx-dark', 'nx-light');
                  
                  // Apply theme immediately
                  if (theme === 'light') {
                    root.classList.add('nx-light');
                  } else {
                    root.classList.add('nx-dark');
                  }
                  
                  // Also set font size
                  var fontSize = localStorage.getItem('nexfix-fontsize') || 'normal';
                  root.setAttribute('data-font-size', fontSize);
                  
                  // Set language
                  var locale = localStorage.getItem('nexfix-locale') || 'en';
                  root.setAttribute('lang', locale === 'my' ? 'my' : 'en');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider refetchOnWindowFocus={false}>
          <NetworkProvider>
            <SettingsProvider>
              <UserBackButton />
              {children}
            </SettingsProvider>
          </NetworkProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
