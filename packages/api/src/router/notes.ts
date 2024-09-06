import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { eq, sql } from "@icebreaker/db";
import { Org } from "@icebreaker/db/schema";

import { takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const notesRouter = {
  getByOrg: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({ notes: Org.notes })
        .from(Org)
        .where(eq(Org.id, input.orgId))
        .then(takeUniqueOrThrow("get org notes"));
    }),

  add: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        note: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(Org)
        .set({
          notes: sql`array_append(${Org.notes}, ${input.note})`,
        })
        .where(eq(Org.id, input.orgId))
        .returning()
        .then(takeUniqueOrThrow("org update"));
    }),

  reset: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(Org)
        .set({
          notes: sql`'{}'::text[]`,
        })
        .where(eq(Org.id, input.orgId))
        .returning()
        .then(takeUniqueOrThrow("org update"));
    }),
} satisfies TRPCRouterRecord;
