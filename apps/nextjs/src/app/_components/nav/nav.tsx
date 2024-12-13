import React from "react";
import Link from "next/link";

import { LogoIcon } from "@icebreaker/ui/icons";

import { NavSettings } from "~/app/_components/nav/nav-settings";
import { SipCluster } from "~/app/_components/nav/sip-cluster";

export const Nav = () => {
  return (
    <nav className="container mx-auto flex items-center justify-between gap-16 py-8">
      <Link href={"/"} className="flex items-center gap-1">
        <div>
          <LogoIcon className="h-[1.65cap] stroke-[1.25px]" />
        </div>
        <div>ICEBREAKER</div>
      </Link>
      <div className="flex items-center gap-2">
        <div>
          <SipCluster />
        </div>
        <div className="flex-shrink-0">
          <NavSettings />
        </div>
      </div>
    </nav>
  );
};
