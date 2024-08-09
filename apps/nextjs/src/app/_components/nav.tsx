import React from "react";

import { auth } from "@acme/auth";

import { AuthShowcase } from "~/app/_components/auth-showcase";

async function NavBar() {
  return (
    <nav className="container mx-auto flex items-center justify-between py-4">
      <div>ICEBREAKER</div>
      <div>
        <AuthShowcase />
      </div>
    </nav>
  );
}

export default NavBar;
