import type { ReactNode } from "react";
import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Expand } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

export default function DashboardLayout({
  children,
  history,
  guesser,
  caller,
  modal,
}: {
  children: ReactNode;
  history: ReactNode;
  guesser: ReactNode;
  caller: ReactNode;
  modal: ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <SectionWrapper title={"History"} path={"history"}>
          {history}
        </SectionWrapper>

        <SectionWrapper title={"Guesser"} path={"guesser"}>
          {guesser}
        </SectionWrapper>

        <SectionWrapper title={"Caller"} path={"caller"}>
          {caller}
        </SectionWrapper>
      </div>
      {modal}
    </div>
  );
}

function SectionWrapper({
  children,
  title,
  path,
}: {
  children: ReactNode;
  title: string;
  path: string;
}) {
  const params = useParams();
  const orgName = params.orgName as string;
  const href = `/${orgName}/${path}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-6">
          <h2>{title}</h2>

          <Link href={href} passHref>
            <Button variant="ghost" size={"icon"}>
              <Expand />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
