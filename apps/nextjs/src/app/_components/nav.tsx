import React from "react";

import { AuthShowcase } from "~/app/_components/auth-showcase";

async function NavBar() {
  return (
    <nav className="container mx-auto flex items-center justify-between py-4">
      <div>ICEBREAKER</div>
      <div className="flex items-center gap-4">
        <AuthShowcase />
      </div>
    </nav>
  );
}

export default NavBar;
