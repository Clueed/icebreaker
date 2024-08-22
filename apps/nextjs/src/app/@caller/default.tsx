import { ActiveCalls } from "~/app/@caller/_components/active-calls/active-calls";
import { CallHistory } from "~/app/@caller/_components/call-history";
import { Caller } from "~/app/@caller/_components/caller";
import { RegisterSipWrapper } from "~/app/@caller/_components/register-sip/register-sip-wrapper";

const CallerPage = async () => {
  return (
    <div className="space-y-4">
      {" "}
      <RegisterSipWrapper />
      <Caller />
      {/* <ActiveCalls /> */}
      <CallHistory />
    </div>
  );
};

export default CallerPage;
