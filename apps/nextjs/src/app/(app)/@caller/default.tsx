"use client";



import { CallHistory } from "~/app/(app)/@caller/_components/call-history/call-history";
import { CurrentCallCluster } from "~/app/(app)/@caller/_components/current-call-cluster/current-call-cluster";

const CallerPage = () => {
  return (
    <div className="space-y-16">
      <CurrentCallCluster />

      <CallHistory />
    </div>
  );
};

export default CallerPage;
