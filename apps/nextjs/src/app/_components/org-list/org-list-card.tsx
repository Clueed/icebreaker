import type { AppRouterOutputs } from "node_modules/@icebreaker/api/dist/root";
import { DateTime } from "luxon";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@icebreaker/ui/card";
import { Skeleton } from "@icebreaker/ui/skeleton";

import { OrgCardContent } from "~/app/_components/org-list/org-list-card-content";

export const OrgCard = ({
  org,
}: {
  org: AppRouterOutputs["org"]["all"][number];
}) => {
  return (
    <Card className="transition-colors duration-700 hover:bg-accent hover:text-accent-foreground">
      <CardHeader>
        <CardTitle className="h-[1.65cap] truncate">{org.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <OrgCardContent org={org} />
      </CardContent>
      <CardFooter>
        <OrgCardFooter org={org} />
      </CardFooter>
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
          <Skeleton className="h-[1.65cap] w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {" "}
        <Skeleton className="h-52 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-[1.65cap] w-full" />
      </CardFooter>
    </Card>
  );
};

const OrgCardFooter = ({
  org,
}: {
  org: AppRouterOutputs["org"]["all"][number];
}) => {
  const compositeDate = org.updatedAt ?? org.createdAt;
  const date = DateTime.fromSQL(compositeDate);
  const formattedDate = date.toFormat("LLL dd, yyyy");
  return <div className="text-xs text-muted-foreground">{formattedDate}</div>;
};
