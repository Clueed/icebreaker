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
        <CardContent>{children}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Caller</CardTitle>
        </CardHeader>
        <CardContent>{caller}</CardContent>
      </Card>
    </div>
  );
};

export default OrgLayout;
