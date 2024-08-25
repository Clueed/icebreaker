import { auth, signIn, signOut } from "@icebreaker/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@icebreaker/ui/avatar";
import { Button } from "@icebreaker/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@icebreaker/ui/popover";

export async function AuthShowcase() {
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
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center justify-center gap-4 opacity-75 transition-opacity hover:opacity-100">
          <p className="truncate leading-none">
            {session.user.name?.split(" ")[0]}
          </p>

          <Avatar className="size-6">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>
              {session.user.name
                ?.split(" ")
                .map((word) => word[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <form>
          <Button
            size="lg"
            variant={"secondary"}
            className="w-full"
            formAction={async () => {
              "use server";
              await signOut();
            }}
          >
            log out
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
