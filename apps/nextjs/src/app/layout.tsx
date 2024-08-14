import type { Metadata, Viewport } from "next";

import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { Suspense } from "react";
import { Urbanist, Victor_Mono } from "next/font/google";

import { CurrentPhoneCallProvider } from "~/app/_components/call-handler/current-call-provider";
import NavBar from "~/app/_components/nav";
import SipProviderConfigured from "~/app/_components/sip-provider";
import { env } from "~/env";

const fontMono = Victor_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontSans = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Create T3 Turbo",
  description: "Simple monorepo with shared backend for web & mobile apps",
  openGraph: {
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: {
  children: React.ReactNode;
  caller: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <SipProviderConfigured>
              <CurrentPhoneCallProvider>
                <NavBar />
                <main className="container flex gap-16">
                  <div className="flex-grow">
                    <Suspense fallback={<div>loading...</div>}>
                      {props.children}
                    </Suspense>
                  </div>
                  <Suspense fallback={<div>loading...</div>}>
                    {props.caller}
                  </Suspense>
                </main>
              </CurrentPhoneCallProvider>
            </SipProviderConfigured>
          </TRPCReactProvider>
          <div className="absolute bottom-4 right-4">
            <ThemeToggle />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
