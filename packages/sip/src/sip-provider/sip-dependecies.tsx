import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { PhoneCallRating } from "@icebreaker/validators/phone-call-rating";

interface ISipDependenciesProvider {
  updatePhoneCall: (args: {
    sessionId: string;
    callSync: boolean;
    data: {
      rating: PhoneCallRating;
    };
  }) => void;
}

export const SipDependenciesContext =
  createContext<ISipDependenciesProvider | null>(null);

export const SipDependenciesProvider = ({
  children,
  context,
}: {
  children: ReactNode;
  context: ISipDependenciesProvider;
}) => {
  return (
    <SipDependenciesContext.Provider value={context}>
      {children}
    </SipDependenciesContext.Provider>
  );
};

export const useSipDependencies = () => {
  const contex = useContext(SipDependenciesContext);
  if (!contex) {
    throw new Error(
      "useSipDependencies must be used within SipDependenciesProvider",
    );
  }
  return contex;
};
