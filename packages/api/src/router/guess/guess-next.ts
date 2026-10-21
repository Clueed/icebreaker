import { z } from "zod";

import { count, eq, inArray, sql } from "@icebreaker/db";
import { Guess, PhoneCall } from "@icebreaker/db/schema";
import { strategySchema } from "@icebreaker/validators/guessing-strategies";
import { generateNextPhoneNumbers } from "@icebreaker/validators/guessing-strategies/apply-strategy";
import { phoneNumbersAreEqual } from "@icebreaker/validators/phone-number";

import { jsonAgg } from "../../helpers";
import { protectedProcedure } from "../../trpc";

export const guessNextProcedure = protectedProcedure
  .input(
    z.object({
      guessId: z.string(),
      strategy: strategySchema,
      cursor: z.string().uuid().nullish(),
      limit: z.number().min(1).max(50).default(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { cursor, limit, strategy } = input;
    const guessId = cursor ?? input.guessId;

    const guess = await ctx.db
      .select({
        id: Guess.id,
        phoneNumber: Guess.phoneNumber,
        orgId: Guess.orgId,
        phoneCallCount: count(PhoneCall.id),
        phoneCallRating: jsonAgg(PhoneCall.rating),
      })
      .from(Guess)
      .where(eq(Guess.id, guessId))
      .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
      .groupBy(Guess.id)
      .then((data) => {
        if (!data[0]) {
          throw new Error("Guess not found");
        }

        return data[0];
      });

    const numToGenerate = limit + 1;

    const guessUpsertInputs = generateNextPhoneNumbers({
      phoneNumber: guess.phoneNumber,
      strategy,
      count: numToGenerate,
    }).map((phoneNumber) => ({
      phoneNumber,
      orgId: guess.orgId,
    }));

    const newGuessIds = await ctx.db
      .insert(Guess)
      .values(guessUpsertInputs)
      .onConflictDoUpdate({
        target: Guess.phoneNumber,
        set: {
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: Guess.id })
      .then((data) => data.map((d) => d.id));

    const newGuesses = await ctx.db
      .select({
        id: Guess.id,
        phoneNumber: Guess.phoneNumber,
        orgId: Guess.orgId,
        phoneCallCount: count(PhoneCall.id),
        phoneCallRating: jsonAgg(PhoneCall.rating),
      })
      .from(Guess)
      .where(inArray(Guess.id, newGuessIds))
      .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
      .groupBy(Guess.id);

    const newGuessesSorted = newGuesses.sort((a, b) => {
      const indexA = guessUpsertInputs.findIndex((inputA) =>
        phoneNumbersAreEqual(inputA.phoneNumber, b.phoneNumber),
      );
      const indexB = guessUpsertInputs.findIndex((inputB) =>
        phoneNumbersAreEqual(inputB.phoneNumber, a.phoneNumber),
      );

      return indexB - indexA;
    });

    const itemCount = newGuesses.length;
    const data = [guess, ...newGuessesSorted.slice(0, itemCount - 1)];
    const nextCursor = newGuesses[itemCount - 1]?.id;

    return {
      data,
      nextCursor,
    };
  });
