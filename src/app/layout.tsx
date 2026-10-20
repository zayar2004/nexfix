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
    <html lang="my" className="nx-dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('nexfix-theme') || 'dark';
                  const fontSize = localStorage.getItem('nexfix-fontsize') || 'md';
                  const lang = localStorage.getItem('nexfix-locale') || 'my';
                  
                  document.documentElement.className = theme === 'dark' ? 'nx-dark' : '';
                  document.documentElement.setAttribute('data-font-size', fontSize);
                  document.documentElement.setAttribute('lang', lang);
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
