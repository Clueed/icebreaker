"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@icebreaker/ui/button";

export const NavClearClientButton = () => {
  const client = useQueryClient();
  const router = useRouter();
  const handleOnClick = () => {
    client.clear();
    router.refresh();
  };
  return (
    <Button
      size="lg"
      variant={"secondary"}
      className="w-full"
      onClick={handleOnClick}
    >
      refresh
    </Button>
  );
};
