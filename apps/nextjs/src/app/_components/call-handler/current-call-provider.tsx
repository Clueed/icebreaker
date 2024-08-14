"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { skipToken } from "@tanstack/react-query";

import { usePhoneCallHandler } from "~/app/_components/call-handler/use-phone-call-handler";
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
