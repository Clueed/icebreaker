"use client";

import React from "react";

import RegisterSip from "~/app/@caller/_components/register-sip/register-sip";
import { api } from "~/trpc/react";

export const RegisterSipWrapper = () => {
  const { data: remoteCredentials, isLoading } =
    api.sipCredentials.get.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return <RegisterSip remoteCredentials={remoteCredentials} />;
};
