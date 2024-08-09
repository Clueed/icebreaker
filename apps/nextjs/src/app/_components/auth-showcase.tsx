import { auth, signIn, signOut } from "@acme/auth";
import { Button } from "@acme/ui/button";
import { LogOutIcon } from "@acme/ui/icons";

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
      <p>
        <span>{session.user.name}</span>
      </p>

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
