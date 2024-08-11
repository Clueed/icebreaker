"use client";

import React from "react";
import { SIPProvider } from "react-sipjs";

import { AddNewGuessForm } from "~/app/playground/[orgId]/_components/add-new-guess-form";
import { CreateOrgForm } from "~/app/playground/[orgId]/_components/create-org-form";
import { PhoneCallProvider } from "~/app/playground/[orgId]/_components/current-call";
import { MakePhoneCall } from "~/app/playground/[orgId]/_components/make-phone-call";
import { OrgList } from "~/app/playground/[orgId]/_components/org-list";
import RegisterSip from "~/app/playground/[orgId]/_components/register-sip";

export function Dashboard({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}) {
  const [currentGuessId, setCurrentGuessId] = React.useState<string | null>(
    null,
  );
  const [currentCallId, setCurrentCallId] = React.useState<string | null>(null);

  return (
    <div>
      PlaygroundPage
      <OrgList currentOrgId={orgId} />
      <CreateOrgForm />
      <div>
        <AddNewGuessForm
          setCurrentGuessId={setCurrentGuessId}
          currentOrgId={orgId}
        />
      </div>
      {currentGuessId && (
        <PhoneCallProvider
          callId={currentCallId}
          setCallId={setCurrentCallId}
          guessId={currentGuessId}
        >
          <div>
            <div>Guess: {currentGuessId}</div>
            <MakePhoneCall
              currentGuessId={currentGuessId}
              currentCallId={currentCallId}
              setCurrentCallId={setCurrentCallId}
            />
          </div>
        </PhoneCallProvider>
      )}
      <RegisterSip userId={userId} />
    </div>
  );
}
