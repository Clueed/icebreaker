import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

const OrgLayout = ({
  children,
  caller,
}: {
  children: React.ReactNode;
  caller: React.ReactNode;
}) => {
  return (
    <div className="flex gap-16">
      <Card className="flex-grow">
        <CardContent>
          <Suspense fallback={<div>loading...</div>}>{children}</Suspense>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <Suspense fallback={<div>loading...</div>}>Caller</Suspense>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>loading...</div>}>{caller}</Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgLayout;
