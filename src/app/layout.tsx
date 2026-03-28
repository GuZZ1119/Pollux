import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { auth0 } from "@/lib/auth0";
import type { SessionUser } from "@/lib/types";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pollux — AI Communication Layer",
  description: "Permissioned AI communication layer for Gmail and Slack",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  const user: SessionUser | null = session
    ? {
        sub: session.user.sub,
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
        picture: session.user.picture ?? undefined,
      }
    : null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
