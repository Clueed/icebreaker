"use client";

import React from "react";

import { SIPProvider } from "@icebreaker/sip";

import { usePhoneCallUpdateMutation } from "~/app/_api-hooks/use-phone-call";

function SipProviderConfigured({ children }: { children: React.ReactNode }) {
  const { mutate: updatePhoneCall } = usePhoneCallUpdateMutation();
  return (
    <SIPProvider
      options={{
        domain: "sipgate.de",
        webSocketServer: "wss://sip.sipgate.de",
      }}
      dependencies={{ updatePhoneCall }}
    >
      {children}
    </SIPProvider>
  );
}

export default SipProviderConfigured;
