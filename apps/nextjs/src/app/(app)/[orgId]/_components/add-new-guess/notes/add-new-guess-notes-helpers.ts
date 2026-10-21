import { normalizePhoneNumber } from "@icebreaker/validators/phone-number";

export const getSimilarNotes = (notes: string[]) => {
  const parsed = notes
    .map((note) => normalizePhoneNumber(note))
    .filter(onlyUnique);
  const similar = checkSimilarities(parsed) ?? [];

  return Object.entries(similar);
};

const checkSimilarities = (list: string[]) => {
  if (!list[0]) return;

  const minLength = list.reduce(
    (acc, b) => Math.min(acc, b.length),
    list[0].length,
  );

  let similar = {} as Record<string, string[]>;

  for (let index = 1; index < minLength; index++) {
    const firstTwoLetters = list.map((number) => getNLetters(number, index));
    const similar2 = firstTwoLetters.filter(onlyUnique);

    if (similar2.length !== list.length) {
      similar = similar2.reduce(
        (acc, b) => {
          const matchingStrins = list
            .filter((a) => a.startsWith(b))
            .map((a) => a.replace(b, ""));
          acc[b] = matchingStrins;
          return acc;
        },
        {} as Record<string, string[]>,
      );
    }
  }

  return similar;
};

function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

const getNLetters = (string: string, n: number) =>
  string.split("").slice(0, n).join("");
