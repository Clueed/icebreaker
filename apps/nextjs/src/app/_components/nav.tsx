import React from "react";

import { LogoIcon } from "@icebreaker/ui/icons";

import { AuthShowcase } from "~/app/_components/auth-showcase";

function NavBar() {
  return (
    <nav className="container mx-auto flex items-center justify-between py-8">
      <div className="flex items-center gap-1">
        <div>
          <LogoIcon className="h-[1.65cap] stroke-[1.5px]" />
        </div>
        <div>ICEBREAKER</div>
        <div className="rounded bg-primary/50 px-1 text-xs font-medium text-background">
          NAVY
        </div>
      </div>
      <div className="flex items-center gap-4">
        <AuthShowcase />
      </div>
    </nav>
  );
}

export default NavBar;
