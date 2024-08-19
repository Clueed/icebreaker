"use client";

import type { Session } from "sip.js";
import { useSIPProvider } from "react-sipjs";

import type { RouterOutputs } from "@acme/api";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { api } from "~/trpc/react";

export const ActiveCalls = () => {
  const { data: aciveCalls = [] } = api.phoneCall.all.useQuery({
    active: true,
  });
  const { data: userSettings } = api.userSettings.get.useQuery();

  const activeCallsWithoutCurrent =
    aciveCalls.filter((call) => call.id !== userSettings?.currentPhoneCallId) ??
    [];

  const { sessions } = useSIPProvider();
  const sessionsArray = Object.entries(sessions);

  const activeCallsSessionIds = aciveCalls.map((call) => call.sessionId);
  const sessionNotRegisterd = sessionsArray.filter(([sessionId, session]) =>
    activeCallsSessionIds.includes(sessionId),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Calls</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 space-y-2 overflow-y-auto">
          <div>
            {activeCallsWithoutCurrent.length > 0
              ? activeCallsWithoutCurrent.map((call) => (
                  <ActiveCall key={call.id} call={call} />
                ))
              : "No active Calls"}
          </div>
          <SessionNotRegisterd
            sessions={sessionNotRegisterd.map((s) => s[1])}
          />
        </CardContent>
      </Card>
    </>
  );
};

const ActiveCall = ({
  call,
}: {
  call: RouterOutputs["phoneCall"]["all"][number];
}) => {
  return (
    <div key={call.id} className="flex p-2">
      <div>
        {call.phoneNumber.base}-{call.phoneNumber.extension}
      </div>
      <div>{call.state}</div>
    </div>
  );
};

export const SessionNotRegisterd = ({ sessions }: { sessions: Session[] }) => {
  return (
    <div>
      Sessions not registerd
      {sessions.map((session) => (
        <div>not registered call</div>
      ))}
    </div>
  );
};
