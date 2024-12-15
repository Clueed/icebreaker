import "~/app/globals.css";

import type { Metadata, Viewport } from "next";
import { Urbanist, Victor_Mono } from "next/font/google";

import { cn } from "@icebreaker/ui";
import { ThemeProvider } from "@icebreaker/ui/theme";
import { Toaster } from "@icebreaker/ui/toast";

import { AnimatedMain } from "~/app/_components/animated-main";
import { CurrentSessionIdProvider } from "~/app/_components/call-handler/current-session-id-context";
import { Nav } from "~/app/_components/nav/nav";
import { PersistGate } from "~/app/_components/perists-gate";
import SipProviderConfigured from "~/app/_components/sip-provider";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

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
        <div
          className="fixed inset-0 -z-50 opacity-5"
          style={{
            backgroundSize: "109px",
            backgroundImage: "url(/rR6HYXBrMmX4cRpXfXUOvpvpB0.png)",
            backgroundRepeat: "repeat",
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <SipProviderConfigured>
              <CurrentSessionIdProvider>
                <Nav />
                <AnimatedMain>
                  <PersistGate>{props.children}</PersistGate>
                </AnimatedMain>
              </CurrentSessionIdProvider>
            </SipProviderConfigured>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
