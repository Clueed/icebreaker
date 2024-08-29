import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { PhoneNumber } from "@icebreaker/validators/phone-number";
import { desc, eq, sql } from "@icebreaker/db";
import { CreatePhoneCallSchema, Guess, PhoneCall } from "@icebreaker/db/schema";
import { phoneNumberSchema } from "@icebreaker/validators/phone-number";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const phoneCallRouter = {
  history: protectedProcedure
    .input(
      z.object({
        // cursor is offset
        cursor: z.number().min(0).default(0),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rawData = await ctx.db.query.PhoneCall.findMany({
        orderBy: desc(PhoneCall.createdAt),
        limit: input.limit,
        offset: input.cursor,
        with: {
          guess: {
            columns: {
              phoneNumber: true,
              orgId: true,
            },
          },
        },
      });

      const itemsCount = rawData.length;
      const data = rawData.map(transformPhoneCall);
      const nextCursor =
        itemsCount < input.limit ? undefined : input.cursor + input.limit;

      return {
        data,
        nextCursor,
      };
    }),

  bySessionId: protectedProcedure
    .input(z.object({ sessionId: z.string().min(10).max(255) }))
    .query(async ({ ctx, input }) => {
      const phoneCall = await ctx.db.query.PhoneCall.findFirst({
        where: eq(PhoneCall.sessionId, input.sessionId),
        with: {
          guess: { columns: { phoneNumber: true, id: true } },
        },
      }).then(findFirstOrThrow("find phone call"));

      return transformPhoneCall(phoneCall);
    }),

  update: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().min(10).max(255),
        data: CreatePhoneCallSchema.pick({
          rating: true,
          answeredAt: true,
          hangupAt: true,
        }),
      }),
    )
    .mutation(({ ctx, input: { sessionId, data } }) => {
      return ctx.db
        .update(PhoneCall)
        .set(data)
        .where(eq(PhoneCall.sessionId, sessionId))
        .returning()
        .then(takeUniqueOrThrow("update phone call"));
    }),

  create: protectedProcedure
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

      return await ctx.db
        .insert(PhoneCall)
        .values({
          sessionId,
          guessId,
        })
        .returning()
        .then(takeUniqueOrThrow("create phone call"));
    }),
} satisfies TRPCRouterRecord;

export const transformPhoneCall = <
  T extends { guess: { phoneNumber: PhoneNumber } },
>(
  phoneCall: T,
) => {
  const { guess, ...rest } = phoneCall;
  return { ...rest, phoneNumber: guess.phoneNumber };
};
