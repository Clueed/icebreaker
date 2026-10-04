import { phoneNumbersAreEqual, phoneNumberSchema } from ".";

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
