import React from "react";

import { auth } from "@acme/auth";

import { Guesser } from "~/app/org/[orgId]/_components/guesser";
import { api, HydrateClient } from "~/trpc/server";

export default async function PlaygroundPage({
  params,
}: {
  params: { orgId: string };
}) {
  const { orgId } = params;

  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  await api.userSettings.set({
    lastViewedOrgId: orgId,
  });

  await api.org.byId.prefetch({ id: orgId });

  return (
    <HydrateClient>
      <div>
        <Guesser orgId={params.orgId} />
      </div>
    </HydrateClient>
  );
}
