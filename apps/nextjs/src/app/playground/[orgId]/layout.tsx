import React from "react";

import NavBar from "~/app/_components/nav";
import SipProviderConfigured from "~/app/playground/[orgId]/_components/sip-provider";

async function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <SipProviderConfigured>
      <div>
        <NavBar />
        {children}
      </div>
    </SipProviderConfigured>
  );
}

export default PlaygroundLayout;
