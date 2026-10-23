import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NetworkProvider } from "@/lib/network-context";
import { SettingsProvider } from "@/lib/settings-context";
import { SessionProvider } from "next-auth/react";
import { UserBackButton } from "@/components/layout/UserBackButton";
import { cookies } from "next/headers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ApprovalGuard } from "@/components/ApprovalGuard";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("nexfix-theme")?.value || "dark";
  const initialClass = themeCookie === "light" ? "nx-light" : "nx-dark";

  return (
    <html lang="my" className={initialClass} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nexfix-theme') || 'dark';
                  var root = document.documentElement;
                  root.classList.remove('nx-dark', 'nx-light');
                  root.classList.add(theme === 'light' ? 'nx-light' : 'nx-dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider refetchOnWindowFocus={false}>
          <ApprovalGuard>
            <NetworkProvider>
              <SettingsProvider>
                <ServiceWorkerRegister />
                <UserBackButton />
                {children}
              </SettingsProvider>
            </NetworkProvider>
          </ApprovalGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
