"use client";

import { Card, CardContent, CardHeader } from "@acme/ui/card";

import { useSyncCallState } from "~/app/_components/call-handler/use-sync-call-state";
import { CallHistory } from "~/app/@caller/_components/call-history";
import { Caller } from "~/app/@caller/_components/caller";
import { SipCluster } from "~/app/@caller/_components/sip-cluster/sip-cluster";

const CallerPage = () => {
  useSyncCallState();

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
