"use client";

import { createContext, useContext, useState } from "react";

const CurrentSessionIdContext = createContext<
  | {
      sessionId: string | null;
      setSessionId: (id: string) => void;
    }
  | undefined
>(undefined);

export const CurrentSessionIdProvider = (props: {
  children: React.ReactNode;
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <CurrentSessionIdContext.Provider
      value={{
        sessionId,
        setSessionId,
      }}
    >
      {props.children}
    </CurrentSessionIdContext.Provider>
  );
};

export const useCurrentSessionId = () => {
  const context = useContext(CurrentSessionIdContext);
  if (!context) {
    throw new Error(
      "useCurrentSessionIdQuery must be used within a CurrentSessionIdProvider",
    );
  }
  return context;
};
