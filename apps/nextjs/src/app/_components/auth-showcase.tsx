import { auth, signIn, signOut } from "@icebreaker/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@icebreaker/ui/avatar";
import { Button } from "@icebreaker/ui/button";
import { LogOutIcon } from "@icebreaker/ui/icons";

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
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={session.user.image ?? undefined} />
          <AvatarFallback>
            {session.user.name
              ?.split("")
              .map((word) => word[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <p className="text-sm">{session.user.name}</p>
      </div>

      <form>
        <Button
          size="icon"
          variant={"ghost"}
          formAction={async () => {
            "use server";
            await signOut();
          }}
        >
          <LogOutIcon />
        </Button>
      </form>
    </div>
  );
}
