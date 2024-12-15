import { Suspense } from "react";

import { Skeleton } from "@icebreaker/ui/skeleton";

import { AnimatedMain } from "~/app/_components/animated-main";
import { CurrentSessionIdProvider } from "~/app/_components/call-handler/current-session-id-context";
import { Nav } from "~/app/_components/nav/nav";
import { PersistGate } from "~/app/_components/perists-gate";
import SipProviderConfigured from "~/app/_components/sip-provider";
import { TRPCReactProvider } from "~/trpc/react";

export default function AppLayout(props: {
  children: React.ReactNode;
  caller: React.ReactNode;
}) {
  return (
    <TRPCReactProvider>
      <SipProviderConfigured>
        <CurrentSessionIdProvider>
          <Nav />
          <AnimatedMain>
            <PersistGate>
              <div className="container flex gap-16 pb-32">
                <div className="flex-grow">
                  <Suspense fallback={<Skeleton className="h-full w-full" />}>
                    {props.children}
                  </Suspense>
                </div>
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  {props.caller}
                </Suspense>
              </div>
            </PersistGate>
          </AnimatedMain>
        </CurrentSessionIdProvider>
      </SipProviderConfigured>
    </TRPCReactProvider>
  );
}
