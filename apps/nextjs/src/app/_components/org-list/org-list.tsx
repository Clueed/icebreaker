"use client";

import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { CreateOrgForm } from "~/app/_components/create-org-form";
import {
  LoadingOrgCard,
  OrgCard,
} from "~/app/_components/org-list/org-list-card";
import { api } from "~/trpc/react";

export function OrgList() {
  const {
    data: orgs,
    isLoading,
    isSuccess,
  } = api.org.all.useQuery(undefined, {
    throwOnError: true,
  });

  const [animateRef] = useAutoAnimate();

  return (
    <div
      className="grid grid-cols-[repeat(auto-fill,minmax(15rem,_1fr))] gap-8"
      ref={animateRef}
    >
      <div>
        <CreateOrgForm />
      </div>
      {isSuccess &&
        orgs.map((org) => (
          <Link href={`/${org.id}`} key={org.id}>
            <OrgCard org={org} />
          </Link>
        ))}
      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => <LoadingOrgCard key={i} />)}
    </div>
  );
}
