import { signOut } from "@icebreaker/auth";
import { DropdownMenuItem } from "@icebreaker/ui/dropdown-menu";
import { LogOutIcon } from "@icebreaker/ui/icons";

export const NavSettingsAuth = () => {
  return (
    <form>
      <DropdownMenuItem asChild>
        <button
          formAction={async () => {
            "use server";
            await signOut();
          }}
          className="w-full"
        >
          <LogOutIcon /> log out
        </button>
      </DropdownMenuItem>
    </form>
  );
};
