"use client";

import React from "react";
import { SIPProvider } from "react-sipjs";

function SipProviderConfigured({ children }: { children: React.ReactNode }) {
  return (
    <SIPProvider
      options={{
        domain: "sipgate.de",
        webSocketServer: "wss://sip.sipgate.de",
      }}
    >
      {children}
    </SIPProvider>
  );
}

export default SipProviderConfigured;
