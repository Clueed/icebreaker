import React from "react";

import { AuthShowcase } from "~/app/_components/auth-showcase";
import { SipStatus } from "~/app/playground/_components/sip-status";

async function NavBar() {
  return (
    <nav className="container mx-auto flex items-center justify-between py-4">
      <div>ICEBREAKER</div>
      <div className="flex items-center gap-4">
        <SipStatus />
        <AuthShowcase />
      </div>
    </nav>
  );
}

export default NavBar;
