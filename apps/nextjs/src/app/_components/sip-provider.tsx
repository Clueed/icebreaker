"use client";

import React from "react";

import { SIPProvider } from "@icebreaker/sip";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";
import { env } from "~/env";

function SipProviderConfigured({ children }: { children: React.ReactNode }) {
  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();
  return (
    <SIPProvider
      options={{
        domain: env.NEXT_PUBLIC_SIP_DOMAIN,
        webSocketServer: env.NEXT_PUBLIC_SIP_WEBSOCKET_SERVER,
      }}
      dependencies={{ updatePhoneCall }}
    >
      {children}
    </SIPProvider>
  );
}

export default SipProviderConfigured;
