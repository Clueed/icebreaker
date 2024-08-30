import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, desc, eq, inArray, isNotNull, sql } from "@icebreaker/db";
import { CreateGuessSchema, Guess, PhoneCall } from "@icebreaker/db/schema";
import { strategySchema } from "@icebreaker/validators/guessing-strategies";
import { generateNextPhoneNumbers } from "@icebreaker/validators/guessing-strategies/apply-strategy";
import { phoneNumbersAreEqual } from "@icebreaker/validators/phone-number";

import { arrayAggNotNull, jsonAgg, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const guessRouter = {
  history: protectedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        onlyWithCalls: z.boolean().optional(),
        // cursor is offset
        cursor: z.number().min(0).default(0),
        // Limit: The number of posts to fetch. The default value is 5.
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor: offset, limit, orgId, onlyWithCalls } = input;
      const rawData = await ctx.db
        .select({
          id: Guess.id,
          phoneNumber: Guess.phoneNumber,
          orgId: Guess.orgId,
          phoneCallCount: count(PhoneCall.id),
          phoneCallRating: jsonAgg(PhoneCall.rating),
          phoneCallAnswered: sql<boolean>`array_length(${arrayAggNotNull(PhoneCall.answeredAt)}, 1) != 0`,
        })
        .from(Guess)
        .offset(offset)
        .limit(limit)
        .where(
          and(
            orgId ? eq(Guess.orgId, orgId) : undefined,
            onlyWithCalls
              ? isNotNull(
                  ctx.db
                    .select({ id: PhoneCall.id })
                    .from(PhoneCall)
                    .where(eq(PhoneCall.guessId, Guess.id))
                    .limit(1),
                )
              : undefined,
          ),
        )
        .orderBy(desc(Guess.updatedAt), desc(Guess.createdAt))
        .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
        .groupBy(Guess.id);

      const itemsCount = rawData.length;
      const data = rawData;
      const nextCursor =
        itemsCount < input.limit ? undefined : input.cursor + input.limit;

      return {
        data,
        nextCursor,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: Guess.id,
          phoneNumber: Guess.phoneNumber,
          orgId: Guess.orgId,
          phoneCallCount: count(PhoneCall.id),
          phoneCallRating: jsonAgg(PhoneCall.rating),
        })
        .from(Guess)
        .where(eq(Guess.id, input.id))
        .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
        .groupBy(Guess.id)
        .then((data) => {
          if (!data[0]) {
            throw new Error("Guess not found");
          }
          return data[0];
        });
    }),

  next: protectedProcedure
    .input(
      z.object({
        guessId: z.string(),
        strategy: strategySchema,
        cursor: z.string().uuid().nullish(),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, strategy } = input;
      const guessId = cursor ?? input.guessId;

      const guess = await ctx.db
        .select({
          id: Guess.id,
          phoneNumber: Guess.phoneNumber,
          orgId: Guess.orgId,
          phoneCallCount: count(PhoneCall.id),
          phoneCallRating: jsonAgg(PhoneCall.rating),
        })
        .from(Guess)
        .where(eq(Guess.id, guessId))
        .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
        .groupBy(Guess.id)
        .then((data) => {
          if (!data[0]) {
            throw new Error("Guess not found");
          }

          return data[0];
        });

      const numToGenerate = limit + 1;

      const guessUpsertInputs = generateNextPhoneNumbers({
        phoneNumber: guess.phoneNumber,
        strategy,
        count: numToGenerate,
      }).map((phoneNumber) => ({
        phoneNumber,
        orgId: guess.orgId,
      }));

      const newGuessIds = await ctx.db
        .insert(Guess)
        .values(guessUpsertInputs)
        .onConflictDoUpdate({
          target: Guess.phoneNumber,
          set: {
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: Guess.id })
        .then((data) => data.map((d) => d.id));

      const newGuesses = await ctx.db
        .select({
          id: Guess.id,
          phoneNumber: Guess.phoneNumber,
          orgId: Guess.orgId,
          phoneCallCount: count(PhoneCall.id),
          phoneCallRating: jsonAgg(PhoneCall.rating),
        })
        .from(Guess)
        .where(inArray(Guess.id, newGuessIds))
        .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
        .groupBy(Guess.id);

      const newGuessesSorted = newGuesses.sort((a, b) => {
        const indexA = guessUpsertInputs.findIndex((inputA) =>
          phoneNumbersAreEqual(inputA.phoneNumber, b.phoneNumber),
        );
        const indexB = guessUpsertInputs.findIndex((inputB) =>
          phoneNumbersAreEqual(inputB.phoneNumber, a.phoneNumber),
        );

        return indexB - indexA;
      });

      const itemCount = newGuesses.length;
      const data = [guess, ...newGuessesSorted.slice(0, itemCount - 1)];
      const nextCursor = newGuesses[itemCount - 1]?.id;

      return {
        data,
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(CreateGuessSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Guess)
        .values(input)
        .onConflictDoUpdate({
          target: Guess.phoneNumber,
          set: {
            updatedAt: sql`now()`,
          },
        })
        .returning()
        .then(takeUniqueOrThrow("guess create"));
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Guess).where(eq(Guess.id, input));
  }),
} satisfies TRPCRouterRecord;
