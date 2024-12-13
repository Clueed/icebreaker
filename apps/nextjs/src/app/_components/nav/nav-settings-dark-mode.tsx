"use client";

import { useTheme } from "next-themes";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@icebreaker/ui/dropdown-menu";
import { SunMoonIcon } from "@icebreaker/ui/icons";

export const NavSettingsDarkMode = () => {
  const { setTheme, theme } = useTheme();
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <SunMoonIcon /> color theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">system</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
