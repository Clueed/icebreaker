import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@acme/db";
import { CreateSipCredentialsSchema, SipCredentials } from "@acme/db/schema";

import { findFirstOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const guessRouter = {
  set: protectedProcedure
    .input(CreateSipCredentialsSchema)
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.query.SipCredentials.findFirst({
        where: eq(SipCredentials.userId, input.userId),
      });

      if (exists) {
        return ctx.db
          .update(SipCredentials)
          .set(input)
          .where(eq(SipCredentials.id, exists.id));
      }

      return ctx.db.insert(SipCredentials).values(input);
    }),

  get: protectedProcedure
    .input(CreateSipCredentialsSchema.pick({ userId: true }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.SipCredentials.findFirst({
        where: eq(SipCredentials.userId, input.userId),
      }).then(findFirstOrThrow("get SipCredentials"));
    }),
} satisfies TRPCRouterRecord;
