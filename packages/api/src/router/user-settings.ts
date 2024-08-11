import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@acme/db";
import { CreateUserSettingsSchema, UserSettings } from "@acme/db/schema";

import { findFirstOrThrow } from "../helpers";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userSettingsRouter = {
  set: protectedProcedure
    .input(CreateUserSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, ...inputWithoutUserId } = input;

      return ctx.db.insert(UserSettings).values(input).onConflictDoUpdate({
        target: UserSettings.userId,
        set: inputWithoutUserId,
      });
    }),

  get: protectedProcedure
    .input(CreateUserSettingsSchema.pick({ userId: true }))
    .query(async ({ ctx, input }) => {
      return (
        (await ctx.db.query.UserSettings.findFirst({
          where: eq(UserSettings.userId, input.userId),
        })) ?? 0
      );
    }),
} satisfies TRPCRouterRecord;
