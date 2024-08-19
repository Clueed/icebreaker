"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { useCurrentCallQuery } from "~/app/_api-hooks/use-current-call";
import { usePhoneCallHandler } from "~/app/_components/call-handler/use-phone-call-handler";

const PhoneCallContext = createContext<ReturnType<
  typeof usePhoneCallHandler
> | null>(null);

export function CurrentPhoneCallProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: phoneCall } = useCurrentCallQuery();

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
