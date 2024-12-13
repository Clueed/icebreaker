"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { DropdownMenuItem } from "@icebreaker/ui/dropdown-menu";
import { HammerIcon } from "@icebreaker/ui/icons";

export const NavSettingsCache = () => {
  const client = useQueryClient();
  const router = useRouter();
  const handleOnClick = () => {
    client.clear();
    router.refresh();
  };
  return (
    <DropdownMenuItem onClick={handleOnClick}>
      <HammerIcon /> clear client cache
    </DropdownMenuItem>
  );
};
