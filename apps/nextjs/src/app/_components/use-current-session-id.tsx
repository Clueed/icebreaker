"use client";

import { createContext, useContext, useState } from "react";

const CurrentSessionIdContext = createContext<
  | {
      currentSessionId: string | null;
      setCurrentSessionId: (id: string) => void;
    }
  | undefined
>(undefined);

export const CurrentSessionIdProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  return (
    <CurrentSessionIdContext.Provider
      value={{ currentSessionId, setCurrentSessionId }}
    >
      {children}
    </CurrentSessionIdContext.Provider>
  );
};

export const useCurrentSessionIdQuery = () => {
  const context = useContext(CurrentSessionIdContext);
  if (!context) {
    throw new Error(
      "useCurrentSessionIdQuery must be used within a CurrentSessionIdProvider",
    );
  }
  return { data: context.currentSessionId };
};

export const useCurrentSessionIdMutation = () => {
  const context = useContext(CurrentSessionIdContext);
  if (!context) {
    throw new Error(
      "useCurrentSessionIdQuery must be used within a CurrentSessionIdProvider",
    );
  }
  return { mutate: context.setCurrentSessionId };
};
