import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";
import { count, desc, eq } from "@icebreaker/db";
import { CreateOrgSchema, Guess, Org, PhoneCall } from "@icebreaker/db/schema";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const orgRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.Org).orderBy(desc(schema.Org.id));
    return ctx.db.query.Org.findMany({
      orderBy: desc(Org.updatedAt),
      //   limit: 10,
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.Org)
      //   .where(eq(schema.Org.id, input.id));

      return ctx.db.query.Org.findFirst({
        where: eq(Org.id, input.id),
      }).then(findFirstOrThrow("Org byId"));
    }),

  extensionStrategyById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.query.Org.findFirst({
        where: eq(Org.id, input.id),
        columns: {
          currentStrategy: true,
        },
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Org not found",
        });
      }

      return (
        org.currentStrategy ??
        ({ numberToAdd: 1, type: "add" } satisfies Strategy)
      );
    }),

  setExtensionStrategy: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: CreateOrgSchema.shape.currentStrategy,
      }),
    )
    .mutation(async ({ ctx, input: { id, data } }) => {
      return ctx.db
        .update(Org)
        .set({ currentStrategy: data })
        .where(eq(Org.id, id));
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: CreateOrgSchema.partial() }))
    .mutation(({ ctx, input: { id, data } }) => {
      return ctx.db.update(Org).set(data).where(eq(Org.id, id));
    }),

  create: protectedProcedure
    .input(CreateOrgSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Org)
        .values(input)
        .returning({ id: Org.id })
        .then(takeUniqueOrThrow("Org create"));
    }),

  statsById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          count: count(PhoneCall.id),
          rating: PhoneCall.rating,
        })
        .from(Org)
        .innerJoin(Guess, eq(Guess.orgId, Org.id))
        .innerJoin(PhoneCall, eq(PhoneCall.guessId, Guess.id))
        .where(eq(Org.id, input.id))
        .groupBy(PhoneCall.rating, Org.id);
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Org).where(eq(Org.id, input));
  }),
} satisfies TRPCRouterRecord;
