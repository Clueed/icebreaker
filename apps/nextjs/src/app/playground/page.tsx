import React from "react";

import { auth } from "@acme/auth";

import { Dashboard } from "~/app/playground/_components/dashboard";
import RegisterSip from "~/app/playground/_components/register-sip";

export default async function PlaygroundPage() {
  const session = await auth();
  if (!session) {
    throw new Error("not authenticated");
  }

  return (
    <>
      <Dashboard userId={session.user.id} />
    </>
  );
}
