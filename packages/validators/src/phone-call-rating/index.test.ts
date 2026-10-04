import { getHighestRated } from ".";

describe("getHighestRated", () => {
  it("returns null for no ratings", () => {
    expect(getHighestRated([])).toBeNull();
  });

  it("returns null when every rating is null", () => {
    expect(getHighestRated([null, null])).toBeNull();
  });

  it("ignores nulls", () => {
    expect(getHighestRated([null, "voicemail", null])).toBe("voicemail");
  });

  it("returns the rating ranked highest in phoneCallRatingList", () => {
    expect(getHighestRated(["voicemail", "jackpot", "answered"])).toBe(
      "jackpot",
    );
    expect(getHighestRated(["person", "answered", "voicemail"])).toBe("person");
  });
});
