import type { Metadata, Viewport } from "next";

import { cn } from "@icebreaker/ui";
import { ThemeProvider, ThemeToggle } from "@icebreaker/ui/theme";
import { Toaster } from "@icebreaker/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { Urbanist, Victor_Mono } from "next/font/google";

import { AnimatedMain } from "~/app/_components/animated-main";
import { PersistGate } from "~/app/_components/perists-gate";
import SipProviderConfigured from "~/app/_components/sip-provider";
import { CurrentSessionIdProvider } from "~/app/_components/use-current-session-id";
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
      ? "https://icebreaker-navy.vercel.app"
      : "http://localhost:3000",
  ),
  title: "Icebreaker",
  description: "Breaking ice like there is no tomorrow",
  openGraph: {
    title: "Icebreaker",
    description: "Breaking ice like there is no tomorrow",
    url: "https://icebreaker-navy.vercel.app",
    siteName: "Icebreaker",
  },
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
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
              <CurrentSessionIdProvider>
                <AnimatedMain>
                  <PersistGate>{props.children}</PersistGate>
                </AnimatedMain>
              </CurrentSessionIdProvider>
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
