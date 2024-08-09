import React from "react";

import NavBar from "~/app/_components/nav";

function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}

export default PlaygroundLayout;
