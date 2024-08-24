"use client";

import React from "react";

import { Guesser } from "~/app/org/[orgId]/_components/guesser";

export default function GuesserPage({ params }: { params: { orgId: string } }) {
  return <Guesser orgId={params.orgId} />;
}
