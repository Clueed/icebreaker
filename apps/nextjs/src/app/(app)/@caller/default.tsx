import { Card, CardContent, CardHeader } from "@icebreaker/ui/card";

import { CallHistory } from "~/app/(app)/@caller/_components/call-history";
import { Caller } from "~/app/(app)/@caller/_components/caller";
import { SipCluster } from "~/app/(app)/@caller/_components/sip-cluster/sip-cluster";

const CallerPage = () => {
  return (
    <div className="space-y-16">
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
