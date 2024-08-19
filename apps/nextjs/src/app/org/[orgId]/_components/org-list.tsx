"use client";

import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import { redirect, useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { api } from "~/trpc/react";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function OrgList({ currentOrgId }: { currentOrgId: string | null }) {
  const { data: orgs } = api.org.all.useQuery();

  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

  // TODO: move to server action
  const { push } = useRouter();
  const handleOnCheckedChange = (orgId: string) => {
    push(`/org/${orgId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{currentOrgId || "Select Org"}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuSeparator />
        {orgs?.map((org) => (
          <DropdownMenuCheckboxItem
            key={org.id}
            checked={org.id === currentOrgId}
            onCheckedChange={() => handleOnCheckedChange(org.id)}
          >
            {org.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
