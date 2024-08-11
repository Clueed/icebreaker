import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@acme/db";
import { CreateOrgSchema, Org } from "@acme/db/schema";

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
      }).then(findFirstOrThrow("org byId"));
    }),

  create: protectedProcedure
    .input(CreateOrgSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Org)
        .values(input)
        .returning({ id: Org.id })
        .then(takeUniqueOrThrow("org create"));
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Org).where(eq(Org.id, input));
  }),
} satisfies TRPCRouterRecord;
