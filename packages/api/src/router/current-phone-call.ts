import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, sql } from "@acme/db";
import { Guess, PhoneCall, UserSettings } from "@acme/db/schema";
import { phoneNumberSchema } from "@acme/validators/phone-number";

import { takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const currentPhoneCallRouter = {
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const userSettings = await ctx.db.query.UserSettings.findFirst({
      where: eq(UserSettings.userId, ctx.session.user.id),
      with: {
        currentPhoneCall2: {
          with: {
            guess: { columns: { phoneNumber: true, id: true } },
          },
        },
      },
    });

    return {
      currentSessionId: userSettings?.currentSessionId ?? null,
      callId: userSettings?.currentPhoneCall2?.id ?? null,
    };
  }),
  setCurrent: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(10).max(255),
        phoneNumber: phoneNumberSchema,
        orgId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sessionId, phoneNumber, orgId } = input;

      const { id: guessId } = await ctx.db
        .insert(Guess)
        .values({ phoneNumber, orgId })
        .onConflictDoUpdate({
          target: Guess.phoneNumber,
          set: {
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: Guess.id })
        .then(takeUniqueOrThrow("create guess"));

      const phoneCall = await ctx.db
        .insert(PhoneCall)
        .values({
          sessionId,
          guessId: guessId,
          state: "Terminated",
        })
        .onConflictDoNothing()
        .returning({
          id: PhoneCall.id,
        });

      return await ctx.db
        .insert(UserSettings)
        .values({
          currentSessionId: sessionId,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: UserSettings.userId,
          set: {
            currentSessionId: sessionId,
          },
        });
    }),
} satisfies TRPCRouterRecord;
