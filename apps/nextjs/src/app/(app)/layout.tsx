import "~/app/globals.css";

import NavBar from "~/app/_components/nav";

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
