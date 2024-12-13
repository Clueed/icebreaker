import { auth, signIn } from "@icebreaker/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@icebreaker/ui/avatar";
import { Button } from "@icebreaker/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@icebreaker/ui/dropdown-menu";

import { NavSettingsAuth } from "~/app/_components/nav/nav-settings-auth";
import { NavSettingsCache } from "~/app/_components/nav/nav-settings-cache";
import { NavSettingsDarkMode } from "~/app/_components/nav/nav-settings-dark-mode";

export async function NavSettings() {
  const session = await auth();

  if (!session) {
    // not used since all routes require auth
    return (
      <form>
        <Button
          size="lg"
          formAction={async () => {
            "use server";
            await signIn("google");
          }}
        >
          Sign in
        </Button>
      </form>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"}>
          <p className="truncate leading-none">
            {session.user.name?.split(" ")[0]}
          </p>

          <Avatar className="size-[2cap]">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>
              {session.user.name
                ?.split(" ")
                .map((word) => word[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <NavSettingsAuth />
        <NavSettingsDarkMode />
        <NavSettingsCache />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
