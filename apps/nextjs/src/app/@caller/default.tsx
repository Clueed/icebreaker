import { auth } from "@acme/auth";

import { CallHistory } from "~/app/@caller/_components/call-history";
import { Caller } from "~/app/@caller/_components/caller";
import RegisterSip from "~/app/@caller/_components/register-sip";
import { api, HydrateClient } from "~/trpc/server";

const CallerPage = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  //   const sipCredentials = await api.sipCredentials.get({
  //     userId: session.user.id,
  //   });

  await api.phoneCall.all.prefetch();

  return (
    <HydrateClient>
      <div>
        {" "}
        <RegisterSip userId={session.user.id} />
        <Caller />
        <CallHistory />
      </div>
    </HydrateClient>
  );
};

export default CallerPage;
