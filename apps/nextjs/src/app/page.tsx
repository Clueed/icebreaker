import React from "react";
import { redirect } from "next/navigation";

import { auth } from "@acme/auth";

import { CreateOrgForm } from "~/app/org/[orgId]/_components/create-org-form";
import { OrgList } from "~/app/org/[orgId]/_components/org-list";

export default async function PlaygroundPage() {
  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  return (
    <>
      <OrgList currentOrgId={null} />
      <CreateOrgForm />
    </>
  );
}
