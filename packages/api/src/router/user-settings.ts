import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@acme/db";
import { CreateUserSettingsSchema, UserSettings } from "@acme/db/schema";

import { findFirstOrThrow } from "../helpers";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userSettingsRouter = {
  set: protectedProcedure
    .input(CreateUserSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const inputWithUserId = { ...input, userId: ctx.session.user.id };

      return ctx.db
        .insert(UserSettings)
        .values(inputWithUserId)
        .onConflictDoUpdate({
          target: UserSettings.userId,
          set: input,
        });
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.UserSettings.findFirst({
      where: eq(UserSettings.userId, ctx.session.user.id),
    });
  }),
} satisfies TRPCRouterRecord;
