import { Suspense } from "react";

import { Skeleton } from "@icebreaker/ui/skeleton";

export default function AppLayout(props: {
  children: React.ReactNode;
  caller: React.ReactNode;
}) {
  return (
    <div className="container flex gap-16 pb-32">
      <div className="flex-grow">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          {props.children}
        </Suspense>
      </div>
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        {props.caller}
      </Suspense>
    </div>
  );
}
