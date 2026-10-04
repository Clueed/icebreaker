import { getAvailableExtensionStrategies } from ".";

describe("getAvailableExtensionStrategies", () => {
  it("offers random plus one addition per extension digit", () => {
    expect(
      getAvailableExtensionStrategies({ base: "+4930", extension: "123" }),
    ).toEqual([
      { type: "random" },
      { type: "add", numberToAdd: 1 },
      { type: "add", numberToAdd: 10 },
      { type: "add", numberToAdd: 100 },
    ]);
  });
});
