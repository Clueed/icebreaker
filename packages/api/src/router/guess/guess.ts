import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, asc, count, desc, eq, isNotNull, sql } from "@icebreaker/db";
import { CreateGuessSchema, Guess, PhoneCall } from "@icebreaker/db/schema";

import { arrayAggNotNull, jsonAgg, takeUniqueOrThrow } from "../../helpers";
import { protectedProcedure } from "../../trpc";
import { guessNextProcedure } from "./guess-next";
import { guessStatsProcedure } from "./guess-stats";

export const guessRouter = {
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

  history: protectedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        onlyWithCalls: z.boolean().optional(),
        cursor: z.number().min(0).default(0),
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

  /* same _logic_ as `stats` but returning guesses with an identical interface to `history` instead of aggregated data
   */
  getByPhoneNumber: protectedProcedure
    .input(
      z.object({
        base: z.string().min(1),
        partialExtension: z.string().min(1),
        extensionLength: z.number(),
        orgId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const extensionLength = input.partialExtension.length;
      const subquery = ctx.db
        .select({
          guessId: sql<string>`${Guess.id}`.as("guessId"),
          base: sql<string>`${Guess.phoneNumber}::json->>'base'`.as("base"),
          extension: sql<string>`${Guess.phoneNumber}::json->>'extension'`.as(
            "extension",
          ),
          partialExtension:
            sql<string>`left(${Guess.phoneNumber}::json->>'extension', ${extensionLength + 1})`.as(
              "partial_extension",
            ),
          extensionLength:
            sql<number>`cast(LENGTH(${Guess.phoneNumber}::json->>'extension') as int)`.as(
              "extension_length",
            ),
          phoneCallCount: count(PhoneCall.id).as("phone_call_count"),
          phoneCallRating: jsonAgg(PhoneCall.rating).as("phone_call_rating"),
          phoneCallAnswered:
            sql<boolean>`array_length(${arrayAggNotNull(PhoneCall.answeredAt)}, 1) != 0`.as(
              "phone_call_answered",
            ),
          phoneNumber: Guess.phoneNumber,
          orgId: Guess.orgId,
        })
        .from(Guess)
        .where(eq(Guess.orgId, input.orgId))
        .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
        .groupBy(Guess.id)
        .as("subquery");

      const data = await ctx.db
        .select({
          id: subquery.guessId,
          phoneNumber: subquery.phoneNumber,
          orgId: subquery.orgId,
          phoneCallCount: subquery.phoneCallCount,
          phoneCallRating: subquery.phoneCallRating,
          phoneCallAnswered: subquery.phoneCallAnswered,
        })
        .from(subquery)
        .where(
          and(
            input.base ? eq(subquery.base, input.base) : undefined,
            input.partialExtension
              ? eq(
                  sql`left(${subquery.partialExtension}, ${extensionLength})`,
                  input.partialExtension,
                )
              : undefined,
            input.extensionLength
              ? eq(subquery.extensionLength, input.extensionLength)
              : undefined,
          ),
        )
        .orderBy(asc(subquery.extension));

      return data;
    }),

  next: guessNextProcedure,
  stats: guessStatsProcedure,
} satisfies TRPCRouterRecord;
