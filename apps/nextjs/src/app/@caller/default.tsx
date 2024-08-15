import { auth } from "@acme/auth";

import { CallHistory } from "~/app/@caller/_components/call-history";
import { Caller } from "~/app/@caller/_components/caller";
import { RegisterSipWrapper } from "~/app/@caller/_components/register-sip-wrapper";

const CallerPage = async () => {
  return (
    <div>
      {" "}
      <RegisterSipWrapper />
      <Caller />
      <CallHistory />
    </div>
  );
};

export default CallerPage;
