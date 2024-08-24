import type { TRPCRouterRecord } from "@trpc/server";
import { desc, eq, sql } from "@icebreaker/db";
import { CreateGuessSchema, Guess, PhoneCall } from "@icebreaker/db/schema";
import { strategySchema } from "@icebreaker/validators/guessing-strategies";
import { generateNextPhoneNumbers } from "@icebreaker/validators/guessing-strategies/apply-strategy";
import { z } from "zod";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const guessRouter = {
  all: protectedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        onlyWithCalls: z.boolean().optional(),
        cursor: z.string().uuid().nullish(),
        // Limit: The number of posts to fetch. The default value is 5.
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, orgId, onlyWithCalls } = input;

      const rawData = await ctx.db.query.Guess.findMany({
        orderBy: desc(Guess.updatedAt),
        where: (guess, { eq, and, isNotNull }) =>
          and(
            cursor ? eq(Guess.id, cursor) : undefined,
            orgId ? eq(Guess.orgId, orgId) : undefined,
            onlyWithCalls
              ? isNotNull(
                  ctx.db
                    .select({ id: PhoneCall.id })
                    .from(PhoneCall)
                    .where(eq(PhoneCall.guessId, guess.id))
                    .limit(1),
                )
              : undefined,
          ),
        limit: limit + 1,
      });

      const data = rawData.slice(0, limit - 1);
      const nextCursor = rawData[limit]?.id;

      return {
        data,
        nextCursor,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.Guess)
      //   .where(eq(schema.Guess.id, input.id));

      return ctx.db.query.Guess.findFirst({
        where: eq(Guess.id, input.id),
        with: {
          phoneCalls: true,
        },
      }).then(findFirstOrThrow("guess"));
    }),

  next: protectedProcedure
    .input(
      z.object({
        guessId: z.string(),
        strategy: strategySchema,
        // Cursor: The cursor from where to start fetching the posts.
        // This will progressively increase as we fetch more posts.
        cursor: z.string().uuid().nullish(),
        // Limit: The number of posts to fetch. The default value is 5.
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, strategy } = input;
      const guessId = cursor ?? input.guessId;

      const guess = await ctx.db.query.Guess.findFirst({
        where: eq(Guess.id, guessId),
      }).then(findFirstOrThrow("guess"));

      const count = limit + 2; // generate one more then neccessary to get next cursor

      const guessUpsertInputs = generateNextPhoneNumbers({
        phoneNumber: guess.phoneNumber,
        strategy,
        count: count,
      }).map((phoneNumber) => ({
        phoneNumber,
        orgId: guess.orgId,
      }));

      const newGuesses = await Promise.all(
        guessUpsertInputs.map(
          async (guessUpsertInput) =>
            await ctx.db
              .insert(Guess)
              .values(guessUpsertInput)
              .onConflictDoUpdate({
                target: Guess.phoneNumber,
                set: {
                  updatedAt: sql`now()`,
                },
              })
              .returning({ id: Guess.id })
              .then(takeUniqueOrThrow("guess create")),
        ),
      );

      const data = [guess, ...newGuesses.slice(0, count - 2)].map((g) => g.id);

      return {
        data,
        nextCursor: newGuesses[count - 1]?.id,
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
