"use client";

import React from "react";

import { SIPProvider } from "@icebreaker/sip";

import {
  usePhoneCallEndedHandler,
  usePhoneCallUpdateMutation,
} from "~/app/_api-hooks/use-phone-call";
import { env } from "~/env";

function SipProviderConfigured({ children }: { children: React.ReactNode }) {
  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();
  const onCallEnded = usePhoneCallEndedHandler();
  return (
    <SIPProvider
      options={{
        domain: env.NEXT_PUBLIC_SIP_DOMAIN,
        webSocketServer: env.NEXT_PUBLIC_SIP_WS_URL,
        iceServers: env.NEXT_PUBLIC_SIP_ICE_SERVERS,
      }}
      dependencies={{ updatePhoneCall, onCallEnded }}
    >
      {children}
    </SIPProvider>
  );
}

export default SipProviderConfigured;
