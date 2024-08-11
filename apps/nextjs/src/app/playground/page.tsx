import React from "react";
import { redirect } from "next/navigation";

import { auth } from "@acme/auth";

import { CreateOrgForm } from "~/app/playground/[orgId]/_components/create-org-form";
import { Dashboard } from "~/app/playground/[orgId]/_components/dashboard";
import { OrgList } from "~/app/playground/[orgId]/_components/org-list";
import RegisterSip from "~/app/playground/[orgId]/_components/register-sip";
import { api } from "~/trpc/server";

export default async function PlaygroundPage() {
  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  const userSettings = await api.userSettings.get({ userId: session.user.id });

  const lastViewedOrgId = userSettings !== 0 && userSettings.lastViewedOrgId;

  if (lastViewedOrgId) {
    return redirect(`/playground/${lastViewedOrgId}`);
  }

  return (
    <>
      <OrgList currentOrgId={null} />
      <CreateOrgForm />
    </>
  );
}
