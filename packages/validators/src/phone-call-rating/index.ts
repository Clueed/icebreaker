import { z } from "zod";

export const phoneCallRatingList = [
  "answered",
  "voicemail",
  "person",
  "jackpot",
] as const;

export const phoneCallRatingSchema = z.enum(phoneCallRatingList);
export type PhoneCallRating = z.infer<typeof phoneCallRatingSchema>;

export const phoneCallRatingSchemaNullable = phoneCallRatingSchema.nullable();
export type PhoneCallRatingNullable = z.infer<
  typeof phoneCallRatingSchemaNullable
>;

export const getHighestRated = (
  ratings: PhoneCallRatingNullable[],
): PhoneCallRatingNullable => {
  return ratings.reduce((highest, rating) => {
    if (rating === null) {
      return highest;
    }

    if (highest === null) {
      return rating;
    }

    return phoneCallRatingList.indexOf(rating) >
      phoneCallRatingList.indexOf(highest)
      ? rating
      : highest;
  }, null);
};

export const sortRatings = (ratings: PhoneCallRating[]) => {
  return phoneCallRatingList.filter((r) => ratings.includes(r));
};
