"use client";

import React from "react";

import { toast } from "@acme/ui/toast";

import { AddNewGuessForm } from "~/app/playground/[orgId]/_components/add-new-guess-form";
import { CreateOrgForm } from "~/app/playground/[orgId]/_components/create-org-form";
import { PhoneCallProvider } from "~/app/playground/[orgId]/_components/current-call";
import { MakePhoneCall } from "~/app/playground/[orgId]/_components/make-phone-call";
import { OrgList } from "~/app/playground/[orgId]/_components/org-list";
import RegisterSip from "~/app/playground/[orgId]/_components/register-sip";
import { api } from "~/trpc/react";

export function Dashboard({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}) {
  const [{ selectedGuessId }] = api.org.byId.useSuspenseQuery({ id: orgId });

  const utils = api.useUtils();
  const { mutate: updateOrg } = api.org.update.useMutation({
    onSettled: async () => {
      await utils.org.all.invalidate();
      await utils.org.byId.invalidate({ id: orgId });
    },
    onError: (error) => {
      toast.error("error updating org: " + error.message);
    },
  });
  function setSelectedGuessId(guessId: string): void {
    updateOrg({ id: orgId, data: { selectedGuessId: guessId } });
  }

  const [userSettings] = api.userSettings.get.useSuspenseQuery({
    userId,
  });

  const currentCallId =
    userSettings !== 0 ? userSettings.currentPhoneCallId : null;

  const { mutate: updateUserSettings } = api.userSettings.set.useMutation({
    onSettled: async () => {
      await utils.userSettings.get.invalidate({ userId });
    },
    onError: (error) => {
      toast.error("error updating user settings: " + error.message);
    },
  });

  function setCurrentPhoneCallId(phoneCallId: string | null): void {
    updateUserSettings({
      userId,
      currentPhoneCallId: phoneCallId,
    });
  }

  return (
    <div>
      PlaygroundPage
      <OrgList currentOrgId={orgId} />
      <CreateOrgForm />
      <div>
        <AddNewGuessForm
          setCurrentGuessId={setSelectedGuessId}
          currentOrgId={orgId}
        />
      </div>
      {selectedGuessId && (
        <PhoneCallProvider
          callId={currentCallId}
          setCallId={setCurrentPhoneCallId}
          guessId={selectedGuessId}
        >
          <div>
            <div>Guess: {selectedGuessId}</div>
            <MakePhoneCall
              currentGuessId={selectedGuessId}
              currentCallId={currentCallId}
              setCurrentCallId={setCurrentPhoneCallId}
            />
          </div>
        </PhoneCallProvider>
      )}
      <RegisterSip userId={userId} />
    </div>
  );
}
