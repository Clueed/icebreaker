import { CreateOrgForm } from "~/app/playground/[orgId]/_components/create-org-form";
import { api } from "~/trpc/react";

export const BaseCreateOrgWrapper = () => {
  function handleSetCurrentOrgId(orgId: string): void {}

  return (
    <>
      <CreateOrgForm setCurrentOrgId={handleSetCurrentOrgId} />
    </>
  );
};
