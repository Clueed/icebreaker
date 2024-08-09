"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

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

export function OrgList({
  currentOrgId,
  setCurrentOrgId,
}: {
  currentOrgId: string | null;
  setCurrentOrgId: (id: string | null) => void;
}) {
  const { data: orgs } = api.org.all.useQuery();

  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

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
            onCheckedChange={() => setCurrentOrgId(org.id)}
          >
            {org.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
