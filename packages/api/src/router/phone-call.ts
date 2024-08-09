import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import { CreatePhoneCallSchema, PhoneCall } from "@acme/db/schema";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { publicProcedure } from "../trpc";

export const phoneCallRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.PhoneCall).orderBy(desc(schema.PhoneCall.id));
    return ctx.db.query.PhoneCall.findMany({
      orderBy: desc(PhoneCall.updatedAt),
      //   limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.PhoneCall)
      //   .where(eq(schema.PhoneCall.id, input.id));

      return ctx.db.query.PhoneCall.findFirst({
        where: eq(PhoneCall.id, input.id),
      }).then(findFirstOrThrow("find phone call"));
    }),

  create: publicProcedure
    .input(CreatePhoneCallSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(PhoneCall)
        .values(input)
        .returning({ id: PhoneCall.id })
        .then(takeUniqueOrThrow("create phone call"));
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        sessionId: z.string(),
        data: CreatePhoneCallSchema.pick({ state: true }),
      }),
    )
    .mutation(({ ctx, input: { id, sessionId, data } }) => {
      return (
        ctx.db
          .update(PhoneCall)
          .set(data)
          // .where(eq(PhoneCall.id, id));
          .where(and(eq(PhoneCall.id, id), eq(PhoneCall.sessionId, sessionId)))
      );
    }),

  delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(PhoneCall).where(eq(PhoneCall.id, input));
  }),
} satisfies TRPCRouterRecord;
