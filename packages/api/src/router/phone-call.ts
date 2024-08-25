import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import type { InferSelectModel } from "@icebreaker/db";
import { and, desc, eq, sql } from "@icebreaker/db";
import { CreatePhoneCallSchema, Guess, PhoneCall } from "@icebreaker/db/schema";
import { phoneNumberSchema } from "@icebreaker/validators/phone-number";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const phoneCallRouter = {
  all: protectedProcedure
    .input(
      z.object({
        cursor: z.string().uuid().nullish(),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rawData = await ctx.db.query.PhoneCall.findMany({
        orderBy: desc(PhoneCall.updatedAt),
        where: and(input.cursor ? eq(PhoneCall.id, input.cursor) : undefined),
        limit: input.limit + 1,
        with: {
          guess: {
            columns: {
              phoneNumber: true,
            },
          },
        },
      });

      const data = rawData.slice(0, input.limit - 1).map(transformPhoneCall);
      const nextCursor = rawData[input.limit]?.id;

      return {
        data,
        nextCursor,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const phoneCall = await ctx.db.query.PhoneCall.findFirst({
        where: eq(PhoneCall.id, input.id),
        with: {
          guess: { columns: { phoneNumber: true, id: true } },
        },
      }).then(findFirstOrThrow("find phone call"));

      return transformPhoneCall(phoneCall);
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
        data: CreatePhoneCallSchema.pick({ rating: true }),
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

type DBPhoneCallWithGuessPhoneNumber = InferSelectModel<typeof PhoneCall> & {
  guess: Pick<InferSelectModel<typeof Guess>, "phoneNumber">;
};

export const transformPhoneCall = (
  phoneCall: DBPhoneCallWithGuessPhoneNumber,
) => {
  const { guess, ...rest } = phoneCall;
  return { ...rest, phoneNumber: guess.phoneNumber };
};
