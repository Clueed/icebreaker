import {
  normalizePhoneNumber,
  phoneNumbersAreEqual,
  phoneNumberSchema,
} from ".";

describe("phoneNumberSchema", () => {
  it.each([
    { base: "+4930123", extension: "00" },
    { base: "030123", extension: "1234" },
  ])("accepts $base / $extension", (phoneNumber) => {
    expect(phoneNumberSchema.safeParse(phoneNumber).success).toBe(true);
  });

  it.each([
    { base: "12", extension: "00" },
    { base: "030-123", extension: "00" },
    { base: "030+123", extension: "00" },
    { base: "030123", extension: "1" },
    { base: "030123", extension: "+12" },
    { base: "030123", extension: "12a" },
  ])("rejects $base / $extension", (phoneNumber) => {
    expect(phoneNumberSchema.safeParse(phoneNumber).success).toBe(false);
  });
});

describe("phoneNumbersAreEqual", () => {
  it("is true when base and extension match", () => {
    expect(
      phoneNumbersAreEqual(
        { base: "+4930", extension: "12" },
        { base: "+4930", extension: "12" },
      ),
    ).toBe(true);
  });

  it("is false when the extension differs", () => {
    expect(
      phoneNumbersAreEqual(
        { base: "+4930", extension: "12" },
        { base: "+4930", extension: "13" },
      ),
    ).toBe(false);
  });

  it("is false when the base differs", () => {
    expect(
      phoneNumbersAreEqual(
        { base: "+4930", extension: "12" },
        { base: "+4940", extension: "12" },
      ),
    ).toBe(false);
  });
});

describe("normalizePhoneNumber", () => {
  it.each([
    ["+49 (0) 30 1234 5610", "+493012345610"],
    ["+49(0)30 1234 5610", "+493012345610"],
    ["0049 (0) 30 1234 5610", "+493012345610"],
    ["+49 30 1234-5610", "+493012345610"],
    ["+49 030 1234 5610", "+493012345610"],
    ["030 / 1234 5610", "+493012345610"],
    ["49 30 1234 5610", "+493012345610"],
    ["  +44 20 7946 0958 ", "+442079460958"],
    ["0044 20 7946 0958", "+442079460958"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });
});
