import React from "react";

import { auth } from "@acme/auth";

import { AuthShowcase } from "~/app/_components/auth-showcase";

async function NavBar() {
  return (
    <nav>
      <div className="container mx-auto flex items-center justify-between">
        <div>ICEBREAKER</div>
        <div>
          <AuthShowcase />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
