"use client";

import type { Strategy } from "@acme/validators/guessing-strategies";

import { useOptimisticOrgMutation } from "~/app/_api-hooks/optimistic-org-update";
import {
  useCurrentStrategyQuery,
  useCurrentStrategySetMutation,
} from "~/app/_api-hooks/use-current-strategy";
import { AddNewGuessForm } from "~/app/org/[orgId]/_components/add-new-guess-form";
import GuesserStrategySelector from "~/app/org/[orgId]/_components/guesser-strategy-selector";
import { NextPhoneNumberSelector } from "~/app/org/[orgId]/_components/next-phone-number-selector";
import { api } from "~/trpc/react";

export const Guesser = ({ orgId }: { orgId: string }) => {
  return (
    <>
      <NextPhoneNumberSelector orgId={orgId} />

      <GuesserStrategySelector
        orgId={orgId}
        onApplyExtensionStrategyOnce={() => {}}
      />

      <AddNewGuessForm orgId={orgId} />
    </>
  );
};
