import { generateNextPhoneNumbers } from ".";

describe("generateNextPhoneNumbers", () => {
  it("chains addition from the previous extension", () => {
    expect(
      generateNextPhoneNumbers({
        phoneNumber: { base: "+4930", extension: "0098" },
        strategy: { type: "add", numberToAdd: 1 },
        count: 3,
      }),
    ).toEqual([
      { base: "+4930", extension: "0099" },
      { base: "+4930", extension: "0100" },
      { base: "+4930", extension: "0101" },
    ]);
  });

  it("returns an empty list for count 0", () => {
    expect(
      generateNextPhoneNumbers({
        phoneNumber: { base: "+4930", extension: "12" },
        strategy: { type: "add", numberToAdd: 1 },
        count: 0,
      }),
    ).toEqual([]);
  });

  it("keeps base and extension length for random guesses", () => {
    const result = generateNextPhoneNumbers({
      phoneNumber: { base: "+4930", extension: "0123" },
      strategy: { type: "random" },
      count: 20,
    });

    expect(result).toHaveLength(20);
    for (const phoneNumber of result) {
      expect(phoneNumber.base).toBe("+4930");
      expect(phoneNumber.extension).toMatch(/^\d{4}$/);
    }
  });
});
