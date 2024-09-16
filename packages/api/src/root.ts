import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./router/auth";
import { guessRouter } from "./router/guess/guess";
import { notesRouter } from "./router/notes";
import { orgRouter } from "./router/org";
import { phoneCallRouter } from "./router/phone-call";
import { sipCredentialsRouter } from "./router/sip-credentials";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  org: orgRouter,
  notes: notesRouter,
  guess: guessRouter,
  phoneCall: phoneCallRouter,
  sipCredentials: sipCredentialsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type AppRouterInputs = inferRouterInputs<AppRouter>;
export type AppRouterOutputs = inferRouterOutputs<AppRouter>;
