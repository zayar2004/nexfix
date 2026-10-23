import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/admin-manifest.json",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
