import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { InferSelectModel } from "@acme/db";
import type { DB } from "@acme/db/client";
import type { Guess } from "@acme/db/schema";
import { and, desc, eq, not } from "@acme/db";
import {
  CreatePhoneCallSchema,
  PhoneCall,
  UserSettings,
} from "@acme/db/schema";

import { findFirstOrThrow, takeUniqueOrThrow } from "../helpers";
import { protectedProcedure } from "../trpc";

export const phoneCallRouter = {
  all: protectedProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        cursor: z.string().uuid().nullish(),
        limit: z.number().min(1).max(50).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rawData = await ctx.db.query.PhoneCall.findMany({
        orderBy: desc(PhoneCall.updatedAt),
        where: and(
          input.cursor ? eq(PhoneCall.id, input.cursor) : undefined,
          input.active ? not(eq(PhoneCall.state, "Terminated")) : undefined,
        ),
        limit: input.limit + 1,
        with: {
          guess: {
            columns: {
              phoneNumber: true,
            },
          },
        },
      });

      const data = rawData.slice(0, input.limit - 1).map(transformPhoneCall);
      const nextCursor = rawData[input.limit]?.id;

      return {
        data,
        nextCursor,
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const phoneCall = await ctx.db.query.PhoneCall.findFirst({
        where: eq(PhoneCall.id, input.id),
        with: {
          guess: { columns: { phoneNumber: true, id: true } },
        },
      }).then(findFirstOrThrow("find phone call"));

      return transformPhoneCall(phoneCall);
    }),

  current: protectedProcedure.query(async ({ ctx }) => {
    const userSettings = await ctx.db.query.UserSettings.findFirst({
      where: eq(UserSettings.userId, ctx.session.user.id),
    });

    if (!userSettings?.currentPhoneCallId) {
      return 0;
    }

    const phoneCall = await ctx.db.query.PhoneCall.findFirst({
      where: eq(PhoneCall.id, userSettings.currentPhoneCallId),
      with: {
        guess: { columns: { phoneNumber: true } },
      },
    }).then(findFirstOrThrow("find phone call"));

    return transformPhoneCall(phoneCall);
  }),

  updateCurrent: protectedProcedure
    .input(
      z.object({
        data: CreatePhoneCallSchema.pick({
          state: true,
          rating: true,
        }).partial(),
      }),
    )
    .mutation(async ({ ctx, input: { data } }) => {
      const userSettings = await ctx.db.query.UserSettings.findFirst({
        where: eq(UserSettings.userId, ctx.session.user.id),
      });

      if (!userSettings?.currentPhoneCallId) {
        return null;
      }

      return ctx.db
        .update(PhoneCall)
        .set(data)
        .where(eq(PhoneCall.id, userSettings.currentPhoneCallId))
        .returning()
        .then(takeUniqueOrThrow("update phone call"));
    }),

  createCurrent: protectedProcedure
    .input(CreatePhoneCallSchema)
    .mutation(async ({ ctx, input }) => {
      const userSettings = await ctx.db.query.UserSettings.findFirst({
        where: eq(UserSettings.userId, ctx.session.user.id),
        with: {
          currentPhoneCall: {
            columns: {
              state: true,
            },
          },
        },
      });

      if (
        userSettings &&
        userSettings.currentPhoneCall?.state !== "Terminated"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Phone call in progress",
        });
      }
      const newPhoneCall = await ctx.db
        .insert(PhoneCall)
        .values(input)
        .returning()
        .then(takeUniqueOrThrow("create phone call"));

      const a = await ctx.db
        .insert(UserSettings)
        .values({
          currentPhoneCallId: newPhoneCall.id,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: UserSettings.userId,
          set: {
            currentPhoneCallId: newPhoneCall.id,
          },
        })
        .returning()
        .then(takeUniqueOrThrow("create user settings"));

      console.log("create user settings", a);

      return newPhoneCall;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: CreatePhoneCallSchema.pick({ rating: true }),
      }),
    )
    .mutation(({ ctx, input: { id, data } }) => {
      return ctx.db
        .update(PhoneCall)
        .set(data)
        .where(eq(PhoneCall.id, id))
        .returning()
        .then(takeUniqueOrThrow("update phone call"));
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(PhoneCall).where(eq(PhoneCall.id, input));
  }),
} satisfies TRPCRouterRecord;

type DBPhoneCallWithGuessPhoneNumber = InferSelectModel<typeof PhoneCall> & {
  guess: Pick<InferSelectModel<typeof Guess>, "phoneNumber">;
};

export const transformPhoneCall = (
  phoneCall: DBPhoneCallWithGuessPhoneNumber,
) => {
  const { guess, ...rest } = phoneCall;
  return { ...rest, phoneNumber: guess.phoneNumber };
};
