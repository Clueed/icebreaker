import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@acme/db";
import { CreateSipCredentialsSchema, SipCredentials } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const sipCredentialsRouter = {
  set: protectedProcedure
    .input(CreateSipCredentialsSchema)
    .mutation(async ({ ctx, input }) => {
      const inputWithUserId = { ...input, userId: ctx.session.user.id };

      return ctx.db
        .insert(SipCredentials)
        .values(inputWithUserId)
        .onConflictDoUpdate({
          target: SipCredentials.userId,
          set: inputWithUserId,
        });
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    await ctx.db.query.SipCredentials.findFirst({
      where: eq(SipCredentials.userId, ctx.session.user.id),
    });
  }),
} satisfies TRPCRouterRecord;
