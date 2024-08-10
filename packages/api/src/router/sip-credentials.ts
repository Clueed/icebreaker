import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@acme/db";
import { CreateSipCredentialsSchema, SipCredentials } from "@acme/db/schema";

import { findFirstOrThrow } from "../helpers";
import { protectedProcedure, publicProcedure } from "../trpc";

export const sipCredentialsRouter = {
  set: protectedProcedure
    .input(CreateSipCredentialsSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, ...inputWithoutUserId } = input;

      return ctx.db.insert(SipCredentials).values(input).onConflictDoUpdate({
        target: SipCredentials.userId,
        set: inputWithoutUserId,
      });
    }),

  get: protectedProcedure
    .input(CreateSipCredentialsSchema.pick({ userId: true }))
    .query(async ({ ctx, input }) => {
      return (
        (await ctx.db.query.SipCredentials.findFirst({
          where: eq(SipCredentials.userId, input.userId),
        })) ?? 0
      );
    }),
} satisfies TRPCRouterRecord;
