import { z } from "zod";

import { and, countDistinct, eq, sql } from "@icebreaker/db";
import { Guess, PhoneCall } from "@icebreaker/db/schema";

import { arrayAggNotNull } from "../../helpers";
import { protectedProcedure } from "../../trpc";

const guessPhoneNumberExtension = sql<string>`${Guess.phoneNumber}::json->>'extension'`;
const guessPhoneNumberBase = sql<string>`${Guess.phoneNumber}::json->>'base'`;

type PhoneCallRatingDB = (typeof PhoneCall.$inferSelect)["rating"];

export const guessStatsProcedure = protectedProcedure
  .input(
    z.object({
      orgId: z.string(),
      base: z.string().optional(),
      partialExtension: z.string().optional(),
      extensionLength: z.number().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const extensionLength = input.partialExtension?.length ?? 0;
    const subquery = ctx.db
      .select({
        guessId: Guess.id,
        base: guessPhoneNumberBase.as("base"),
        extension: sql<string>`${guessPhoneNumberExtension}`.as("extension"),
        extensionLength:
          sql<number>`cast(LENGTH(${guessPhoneNumberExtension}) as int)`.as(
            "extension_length",
          ),
        partialExtension:
          sql<string>`left(${guessPhoneNumberExtension}, ${extensionLength + 1})`.as(
            "partial_extension",
          ),
        phoneCallRating: PhoneCall.rating,
        phoneCallAnsweredAt: PhoneCall.answeredAt,
      })
      .from(Guess)
      .where(eq(Guess.orgId, input.orgId))
      .leftJoin(PhoneCall, eq(Guess.id, PhoneCall.guessId))
      .groupBy(Guess.id, PhoneCall.rating, PhoneCall.answeredAt)
      .as("subquery");

    const data = await ctx.db
      .select({
        guessCount: countDistinct(subquery.guessId),
        base: subquery.base,
        partialExtension: subquery.partialExtension,
        extensionLength: subquery.extensionLength,
        ratings: sql<
          PhoneCallRatingDB[]
        >`json_agg(distinct ${subquery.phoneCallRating})`,
        anyAnswered: sql<boolean>`array_length(${arrayAggNotNull(subquery.phoneCallAnsweredAt)}, 1) != 0`,
      })
      .from(subquery)
      .where(
        and(
          input.base ? eq(subquery.base, input.base) : undefined,
          input.partialExtension
            ? eq(
                sql`left(${subquery.partialExtension}, ${extensionLength})`,
                input.partialExtension,
              )
            : undefined,
          input.extensionLength
            ? eq(subquery.extensionLength, input.extensionLength)
            : undefined,
        ),
      )
      .groupBy(
        subquery.base,
        subquery.partialExtension,
        subquery.extensionLength,
      );

    const transformedData = transform(data);

    return transformedData;
  });

const transform = (
  data: {
    guessCount: number;
    base: string;
    partialExtension: string;
    extensionLength: number;
    ratings: PhoneCallRatingDB[];
    anyAnswered: boolean;
  }[],
) => {
  return data.reduce((acc, item) => {
    const { base, partialExtension, extensionLength, ...rest } = item;

    let baseObj = acc.find((entry) => entry.base === base);
    if (!baseObj) {
      baseObj = { base, extensionLengthGroups: [] };
      acc.push(baseObj);
    }

    let extensionLengthObj = baseObj.extensionLengthGroups.find(
      (entry) => entry.extensionLength === extensionLength,
    );
    if (!extensionLengthObj) {
      extensionLengthObj = { extensionLength, partialExtensionGroups: [] };
      baseObj.extensionLengthGroups.push(extensionLengthObj);
    }

    let partialExtensionObj = extensionLengthObj.partialExtensionGroups.find(
      (entry) => entry.partialExtension === partialExtension,
    );
    if (!partialExtensionObj) {
      partialExtensionObj = { partialExtension, ...rest };
      extensionLengthObj.partialExtensionGroups.push(partialExtensionObj);
    }

    return acc;
  }, [] as BaseGroups[]);
};

export interface BaseGroups {
  base: string;
  extensionLengthGroups: {
    extensionLength: number;
    partialExtensionGroups: {
      partialExtension: string;
      guessCount: number;
      ratings: PhoneCallRatingDB[];
      anyAnswered: boolean;
    }[];
  }[];
}
