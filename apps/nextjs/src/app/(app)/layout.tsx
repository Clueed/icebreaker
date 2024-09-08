import "~/app/globals.css";

import { AnimatedMain } from "~/app/_components/animated-main";
import NavBar from "~/app/_components/nav";
import { PersistGate } from "~/app/_components/perists-gate";

export default function AppLayout(props: {
  children: React.ReactNode;
  caller: React.ReactNode;
}) {
  return (
    <div>
      <NavBar />
      <div className="container flex gap-16">
        <div className="flex-grow">{props.children}</div>
        {props.caller}
      </div>
    </div>
  );
}
