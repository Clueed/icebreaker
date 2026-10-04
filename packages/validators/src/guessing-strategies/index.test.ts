import {
  extionsionStrategiesAreEqual,
  isAdditionStrategy,
  isRandomStrategy,
} from ".";

describe("strategy type guards", () => {
  it("identifies addition strategies", () => {
    expect(isAdditionStrategy({ type: "add", numberToAdd: 1 })).toBe(true);
    expect(isAdditionStrategy({ type: "random" })).toBe(false);
  });

  it("identifies random strategies", () => {
    expect(isRandomStrategy({ type: "random" })).toBe(true);
    expect(isRandomStrategy({ type: "add", numberToAdd: 1 })).toBe(false);
  });
});

describe("extionsionStrategiesAreEqual", () => {
  it("compares addition strategies by numberToAdd", () => {
    expect(
      extionsionStrategiesAreEqual(
        { type: "add", numberToAdd: 10 },
        { type: "add", numberToAdd: 10, loopAtPower: 2 },
      ),
    ).toBe(true);
    expect(
      extionsionStrategiesAreEqual(
        { type: "add", numberToAdd: 10 },
        { type: "add", numberToAdd: 1 },
      ),
    ).toBe(false);
  });

  it("treats all random strategies as equal", () => {
    expect(
      extionsionStrategiesAreEqual({ type: "random" }, { type: "random" }),
    ).toBe(true);
  });

  it("is false across strategy types", () => {
    expect(
      extionsionStrategiesAreEqual(
        { type: "random" },
        { type: "add", numberToAdd: 1 },
      ),
    ).toBe(false);
  });
});
