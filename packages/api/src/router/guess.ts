import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { DB } from "@acme/db/client";
import type { NotEmptyPhoneNumber } from "@acme/validators/phone-number";
import { desc, eq } from "@acme/db";
import { CreateGuessSchema, Guess } from "@acme/db/schema";
import { strategySchema } from "@acme/validators/guessing-strategies";
import { applyStrategy } from "@acme/validators/guessing-strategies/apply-strategy";
import { notEmptyphoneNumberSchema } from "@acme/validators/phone-number";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure, publicProcedure } from "../trpc";

export const guessRouter = {
  all: protectedProcedure
    .input(z.object({ orgId: z.string().optional() }).optional())
    .query(({ ctx, input }) => {
      return ctx.db.query.Guess.findMany({
        orderBy: desc(Guess.updatedAt),
        where: input && input.orgId ? eq(Guess.orgId, input.orgId) : undefined,
        limit: 10,
      });
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
      }).then(findFirstOrThrow("guess"));
    }),

  next: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        phoneNumber: notEmptyphoneNumberSchema,
        strategy: strategySchema,
        count: z.number().min(1).optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { phoneNumber, strategy, count } = input;

      const newPhoneNumbers = Array.from({ length: count }).reduce(
        (acc: NotEmptyPhoneNumber[], _, index) => {
          const newExtension = applyStrategy(
            acc[index - 1]?.extension ?? phoneNumber.extension,
            strategy,
          );

          const newPhoneNumber: NotEmptyPhoneNumber = {
            base: phoneNumber.base,
            extension: newExtension,
          };

          return [...acc, newPhoneNumber];
        },
        [] as NotEmptyPhoneNumber[],
      );

      const createGuessInputs = newPhoneNumbers.map((phoneNumber) => ({
        phoneNumber,
        orgId: input.orgId,
      }));

      return await createGuesses(ctx.db, createGuessInputs);
    }),

  create: protectedProcedure
    .input(CreateGuessSchema)
    .mutation(({ ctx, input }) => {
      return createGuesses(ctx.db, [input]).then(
        takeUniqueOrThrow("guess create"),
      );
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Guess).where(eq(Guess.id, input));
  }),
} satisfies TRPCRouterRecord;

const createGuesses = async (
  db: DB,
  guessesInputs: z.infer<typeof CreateGuessSchema>[],
) => {
  return (
    db
      .insert(Guess)
      .values(guessesInputs)
      // .onConflictDoUpdate({ target: Guess.id, set: {} }) // for updatedAt
      .onConflictDoNothing()
      .returning()
  );
};
