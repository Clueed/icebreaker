import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@icebreaker/db";
import {
  CreateSipCredentialsSchema,
  SipCredentials,
} from "@icebreaker/db/schema";

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
    return (
      (await ctx.db.query.SipCredentials.findFirst({
        where: eq(SipCredentials.userId, ctx.session.user.id),
      })) ?? null
    );
  }),
} satisfies TRPCRouterRecord;
