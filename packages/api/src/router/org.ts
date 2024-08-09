import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { desc, eq } from "@acme/db";
import { CreateOrgSchema, Org } from "@acme/db/schema";

import { takeUniqueOrThrow } from "../helpers";
import { publicProcedure } from "../trpc";

export const orgRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.Org).orderBy(desc(schema.Org.id));
    return ctx.db.query.Org.findMany({
      orderBy: desc(Org.updatedAt),
      //   limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.Org)
      //   .where(eq(schema.Org.id, input.id));

      return ctx.db.query.Org.findFirst({
        where: eq(Org.id, input.id),
      });
    }),

  create: publicProcedure.input(CreateOrgSchema).mutation(({ ctx, input }) => {
    return ctx.db
      .insert(Org)
      .values(input)
      .returning({ id: Org.id })
      .then(takeUniqueOrThrow("org create"));
  }),

  delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Org).where(eq(Org.id, input));
  }),
} satisfies TRPCRouterRecord;
