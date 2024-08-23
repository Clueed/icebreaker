import { Card, CardContent, CardHeader } from "@acme/ui/card";

import { ActiveCalls } from "~/app/@caller/_components/active-calls/active-calls";
import { CallHistory } from "~/app/@caller/_components/call-history";
import { Caller } from "~/app/@caller/_components/caller";
import { SipCluster } from "~/app/@caller/_components/sip-cluster/sip-cluster";

const CallerPage = async () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <SipCluster />
        </CardHeader>
        <CardContent>
          <Caller />
        </CardContent>
      </Card>
      <CallHistory />
    </div>
  );
};

export default CallerPage;
