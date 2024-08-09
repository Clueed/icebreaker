import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./router/auth";
import { guessRouter } from "./router/guess";
import { orgRouter } from "./router/org";
import { phoneCallRouter } from "./router/phone-call";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  org: orgRouter,
  guess: guessRouter,
  phoneCall: phoneCallRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type AppRouterInputs = inferRouterInputs<AppRouter>;
export type AppRouterOutputs = inferRouterOutputs<AppRouter>;
