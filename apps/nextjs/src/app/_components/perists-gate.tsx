"use client";

import { useIsRestoring } from "@tanstack/react-query";

import { Loader2Icon } from "@icebreaker/ui/icons";

export const PersistGate = ({
  children,
  fallback = <DefaultFallback />,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const isRestoring = useIsRestoring();

  return isRestoring ? fallback : children;
};

const DefaultFallback = () => (
  <div className="flex size-full items-center justify-center">
    <Loader2Icon className="animate-spin" />
  </div>
);
