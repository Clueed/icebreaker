"use client";

import React from "react";
import { SIPProvider } from "react-sipjs";

import { AddNewGuessForm } from "~/app/playground/_components/add-new-guess-form";
import { CreateOrgForm } from "~/app/playground/_components/create-org-form";
import { PhoneCallProvider } from "~/app/playground/_components/current-call";
import { MakePhoneCall } from "~/app/playground/_components/make-phone-call";
import { OrgList } from "~/app/playground/_components/org-list";
import RegisterSip from "~/app/playground/_components/register-sip";

export function Dashboard({ userId }: { userId: string }) {
  const [currentOrgId, setCurrentOrgId] = React.useState<string | null>(null);
  const [currentGuessId, setCurrentGuessId] = React.useState<string | null>(
    null,
  );
  const [currentCallId, setCurrentCallId] = React.useState<string | null>(null);

  return (
    <div>
      PlaygroundPage
      <OrgList currentOrgId={currentOrgId} setCurrentOrgId={setCurrentOrgId} />
      <CreateOrgForm setCurrentOrgId={setCurrentOrgId} />
      {currentOrgId && (
        <div>
          <AddNewGuessForm
            setCurrentGuessId={setCurrentGuessId}
            currentOrgId={currentOrgId}
          />
        </div>
      )}
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
