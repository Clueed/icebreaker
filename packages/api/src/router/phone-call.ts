import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq, not } from "@acme/db";
import { CreatePhoneCallSchema, PhoneCall } from "@acme/db/schema";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

// TODO:
// - filter by user
// - infinity
export const phoneCallRouter = {
  all: protectedProcedure
    .input(z.object({ active: z.boolean().optional() }))
    .query(({ ctx, input }) => {
      // return ctx.db.select().from(schema.PhoneCall).orderBy(desc(schema.PhoneCall.id));
      return ctx.db.query.PhoneCall.findMany({
        orderBy: desc(PhoneCall.updatedAt),
        where: input.active
          ? not(eq(PhoneCall.state, "Terminated"))
          : undefined,
        limit: 10,
        with: {
          guess: {
            columns: {
              phoneNumber: true,
            },
          },
        },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.PhoneCall)
      //   .where(eq(schema.PhoneCall.id, input.id));

      return ctx.db.query.PhoneCall.findFirst({
        where: eq(PhoneCall.id, input.id),
        with: {
          guess: { columns: { phoneNumber: true, id: true } },
        },
      }).then(findFirstOrThrow("find phone call"));
    }),

  create: protectedProcedure
    .input(CreatePhoneCallSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(PhoneCall)
        .values(input)
        .returning({ id: PhoneCall.id })
        .then(takeUniqueOrThrow("create phone call"));
    }),

  update: protectedProcedure
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
          .returning()
          .then(takeUniqueOrThrow("update phone call"))
      );
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(PhoneCall).where(eq(PhoneCall.id, input));
  }),
} satisfies TRPCRouterRecord;
