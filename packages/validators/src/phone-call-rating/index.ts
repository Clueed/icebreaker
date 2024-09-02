import { z } from "zod";

export const dbPhoneCallRatingList = [
  "voicemail",
  "person",
  "jackpot",
] as const;

export const getRating = (phoneCall?: {
  rating: (typeof dbPhoneCallRatingList)[number] | null;
  answeredAt: string | null;
}) => {
  if (!phoneCall) {
    return null;
  }

  if (phoneCall.answeredAt === null) {
    return null;
  }

  switch (phoneCall.rating) {
    case null:
      return "answered";
    default:
      return phoneCall.rating;
  }
};

export type PhoneCallRating = ReturnType<typeof getRating>;

export const phoneCallRatingList2 = [
  "answered",
  "voicemail",
  "person",
  "jackpot",
] as const;

export const phoneCallRatingSchema = z.enum(phoneCallRatingList2);

export const getHighestRated = (
  ratings: PhoneCallRating[],
): PhoneCallRating => {
  return ratings.reduce((highest, rating) => {
    if (rating === null) {
      return highest;
    }

    if (highest === null) {
      return rating;
    }

    return phoneCallRatingList2.indexOf(rating) >
      phoneCallRatingList2.indexOf(highest)
      ? rating
      : highest;
  }, null);
};

export const ratingToDbValue = (
  rating: PhoneCallRating,
): (typeof dbPhoneCallRatingList)[number] | null => {
  if (rating === "answered") {
    return null;
  }

  return rating;
};
