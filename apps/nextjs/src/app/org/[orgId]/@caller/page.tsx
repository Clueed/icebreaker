import { auth } from "@acme/auth";

import RegisterSip from "~/app/org/[orgId]/_components/register-sip";
import SipProviderConfigured from "~/app/org/[orgId]/_components/sip-provider";
import { CallHistory } from "~/app/org/[orgId]/@caller/_components/call-history";
import { Caller } from "~/app/org/[orgId]/@caller/_components/caller";
import { api, HydrateClient } from "~/trpc/server";

const CallerPage = async () => {
  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  //   results in auth error (???)
  //   const sipCredentials = await api.sipCredentials.get({
  //     userId: session.user.id,
  //   });

  await api.phoneCall.all.prefetch();

  return (
    <>
      {" "}
      <HydrateClient>
        <RegisterSip userId={session.user.id} />
        <Caller userId={session.user.id} />
        <CallHistory />
      </HydrateClient>
    </>
  );
};

export default CallerPage;
