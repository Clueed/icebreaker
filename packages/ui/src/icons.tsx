import type { LucideProps } from "lucide-react";
import { ShipIcon } from "lucide-react";

export * from "lucide-react";

export const LogoIcon = (props: LucideProps) => (
  <ShipIcon strokeLinecap="butt" {...props} />
);
