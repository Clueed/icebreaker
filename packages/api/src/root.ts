import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./router/auth";
import { currentPhoneCallRouter } from "./router/current-phone-call";
import { guessRouter } from "./router/guess";
import { orgRouter } from "./router/org";
import { phoneCallRouter } from "./router/phone-call";
import { sipCredentialsRouter } from "./router/sip-credentials";
import { userSettingsRouter } from "./router/user-settings";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  org: orgRouter,
  guess: guessRouter,
  phoneCall: phoneCallRouter,
  sipCredentials: sipCredentialsRouter,
  userSettings: userSettingsRouter,
  currentPhoneCall: currentPhoneCallRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type AppRouterInputs = inferRouterInputs<AppRouter>;
export type AppRouterOutputs = inferRouterOutputs<AppRouter>;
