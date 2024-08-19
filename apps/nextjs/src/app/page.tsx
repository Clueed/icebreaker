import React from "react";

import { CreateOrgForm } from "~/app/_components/create-org-form";
import { OrgList } from "~/app/org/[orgId]/_components/org-list";

export default async function NoOrgPage() {
  return (
    <>
      <OrgList currentOrgId={null} />
      <CreateOrgForm />
    </>
  );
}
