import type { AppRouterOutputs } from "node_modules/@icebreaker/api/dist/root";
import { DateTime } from "luxon";

import { cn } from "@icebreaker/ui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@icebreaker/ui/card";
import { Skeleton } from "@icebreaker/ui/skeleton";

import { OrgCardContent } from "~/app/_components/org-list/org-list-card-content";
import { getHumanReadablePastDuration } from "~/app/(app)/@caller/_components/call-history/get-human-readable-past-duration";

export const OrgCard = ({
  org,
}: {
  org: AppRouterOutputs["org"]["all"][number];
}) => {
  return (
    <Card className="h-full transition-colors duration-700 hover:bg-accent hover:text-accent-foreground">
      <CardHeader>
        <CardTitle className="h-[1.65cap] truncate">{org.name}</CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <OrgCardDate org={org} />
          <OrgCardTodos org={org} />
        </div>
      </CardHeader>
      <CardContent>
        <OrgCardContent org={org} />
      </CardContent>
    </Card>
  );
};

export const LoadingOrgCard = () => {
  return (
    <Card
      className="cursor-not-allowed transition-colors duration-700 hover:bg-accent hover:text-accent-foreground"
      aria-disabled
    >
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-[1.65cap] w-[20ch]" />
        </CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-[1.45cap] w-[15ch]" />
          <Skeleton className="h-[1.45cap] w-[5ch]" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-52 w-full" />
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

const OrgCardDate = ({
  org,
}: {
  org: AppRouterOutputs["org"]["all"][number];
}) => {
  const compositeDate = org.updatedAt ?? org.createdAt;
  const date = DateTime.fromSQL(compositeDate);
  const formattedDate = date.toFormat("LLL dd, yyyy");
  const humanReadablePast = getHumanReadablePastDuration(date);
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <div className="">{humanReadablePast}</div>/
      <div className="">{formattedDate}</div>
    </div>
  );
};

const OrgCardTodos = ({
  org,
}: {
  org: AppRouterOutputs["org"]["all"][number];
}) => {
  const todos = org.todos;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {todos.map((todo) => (
        <div
          key={todo.name}
          className={cn(
            "size-2 rounded-sm",
            todo.done ? "bg-secondary-foreground" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
};
