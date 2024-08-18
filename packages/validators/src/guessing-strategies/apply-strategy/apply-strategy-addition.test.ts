import type { AdditionStrategy } from "../strategy-addition";
import applyStrategyAddition from "./apply-strategy-addition";

describe("apply-strategy-addition", () => {
  (
    [
      {
        input: "1234",
        strategy: {
          type: "add",
          numberToAdd: 1,
          loopAtPower: undefined,
        },
        expectedOutput: "1235",
      },
      {
        input: "1234",
        strategy: {
          type: "add",
          numberToAdd: 10,
          loopAtPower: undefined,
        },
        expectedOutput: "1244",
      },
      {
        input: "1234",
        strategy: {
          type: "add",
          numberToAdd: 100,
          loopAtPower: undefined,
        },
        expectedOutput: "1334",
      },
      {
        input: "1234",
        strategy: {
          type: "add",
          numberToAdd: 1000,
          loopAtPower: undefined,
        },
        expectedOutput: "2234",
      },
      // loopAtPower
      {
        input: "01234",
        strategy: {
          type: "add",
          numberToAdd: 9,
          loopAtPower: 0,
        },
        expectedOutput: "01233",
      },
      {
        input: "01234",
        strategy: {
          type: "add",
          numberToAdd: 90,
          loopAtPower: 1,
        },
        expectedOutput: "01224",
      },
      {
        input: "01234",
        strategy: {
          type: "add",
          numberToAdd: 900,
          loopAtPower: 2,
        },
        expectedOutput: "01134",
      },
      {
        input: "01234",
        strategy: {
          type: "add",
          numberToAdd: 9000,
          loopAtPower: 3,
        },
        expectedOutput: "00234",
      },
      {
        input: "91234",
        strategy: {
          type: "add",
          numberToAdd: 90000,
          loopAtPower: 4,
        },
        expectedOutput: "81234",
      },
    ] satisfies {
      input: string;
      strategy: AdditionStrategy;
      expectedOutput: string;
    }[]
  ).forEach(({ input, strategy, expectedOutput }) => {
    it(`should add ${strategy.numberToAdd} and loop at power ${strategy.loopAtPower}`, () => {
      const newExtension = applyStrategyAddition(input, strategy);
      expect(newExtension).toBe(expectedOutput);
    });
  });

  it("should add 1 and preverse leading zeros", () => {
    const newExtension = applyStrategyAddition("0001234", {
      type: "add",
      numberToAdd: 1,
    });
    expect(newExtension).toBe("0001235");
  });

  it("should add 10 and preverse leading zeros", () => {
    const newExtension = applyStrategyAddition("01234", {
      type: "add",
      numberToAdd: 10,
    });
    expect(newExtension).toBe("01244");
  });

  it("should throw on bigger number", () => {
    expect(() => {
      applyStrategyAddition("1234", { type: "add", numberToAdd: 10000 });
    }).toThrow();
  });
});
