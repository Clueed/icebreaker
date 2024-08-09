import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@acme/db";
import { CreateGuessSchema, Guess } from "@acme/db/schema";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure, publicProcedure } from "../trpc";

export const guessRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.Guess).orderBy(desc(schema.Guess.id));
    return ctx.db.query.Guess.findMany({
      orderBy: desc(Guess.updatedAt),
      //   limit: 10,
    });
  }),

  byId: publicProcedure
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

  create: publicProcedure
    .input(CreateGuessSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Guess)
        .values(input)
        .returning({ id: Guess.id })
        .then(takeUniqueOrThrow("guess create"));
    }),

  delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Guess).where(eq(Guess.id, input));
  }),
} satisfies TRPCRouterRecord;
