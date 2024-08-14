"use client";

import type { AppRouterOutputs } from "node_modules/@acme/api/dist/root";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { useSIPProvider } from "react-sipjs";
import { SessionState } from "sip.js";

import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { toast } from "@acme/ui/toast";

import { useOptimisticUserSettingsMutation } from "~/app/_api-hooks/optimistic-user-settings-update";
import { useEndCall } from "~/app/_components/call-handler/use-end-call";
import { usePhoneCallHandler } from "~/app/_components/call-handler/use-phone-call-handler";
import useStartCall from "~/app/_components/call-handler/use-start-call";
import { useSyncCallState } from "~/app/_components/call-handler/use-sync-call-state";
import { api } from "~/trpc/react";

const PhoneCallContext = createContext<ReturnType<
  typeof usePhoneCallHandler
> | null>(null);

export function CurrentPhoneCallProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: userSettings } = api.userSettings.get.useQuery();
  const { data: phoneCall } = api.phoneCall.byId.useQuery(
    userSettings?.currentPhoneCallId
      ? {
          id: userSettings?.currentPhoneCallId,
        }
      : skipToken,
  );

  const phoneCallHandler = usePhoneCallHandler({ phoneCall });
  return (
    <PhoneCallContext.Provider value={phoneCallHandler}>
      {children}
    </PhoneCallContext.Provider>
  );
}

export const useCurrentPhoneCall = () => {
  const context = useContext(PhoneCallContext);
  if (!context) {
    throw new Error("usePhoneCall must be used within a PhoneCallProvider");
  }
  return context;
};
