import React from "react";

import { auth } from "@acme/auth";

import { Dashboard } from "~/app/org/[orgId]/_components/dashboard";
import { Guesser } from "~/app/org/[orgId]/_components/guesser";
import RegisterSip from "~/app/org/[orgId]/_components/register-sip";
import { api, HydrateClient } from "~/trpc/server";

export default async function PlaygroundPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;

  await api.org.byId.prefetch({ id: orgId });

  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  await api.userSettings.set({
    userId: session.user.id,
    lastViewedOrgId: orgId,
  });

  return (
    <>
      <HydrateClient>
        {/* <Dashboard userId={session.user.id} orgId={orgId} /> */}
        <Guesser orgId={params.orgId} />
      </HydrateClient>
    </>
  );
}
