import { z } from "zod";

import { CountryDialCodes } from "./country-codes";

const phoneNumberSchema = z.object({
  base: z
    .string()
    .regex(/^\+?\d+$/, { message: "can only contain numbers" })
    .min(3, {
      message: "must be at least 5 characters.",
    }),
  extension: z
    .string()
    .regex(/^\d+$/, { message: "can only contain numbers" })
    .min(2, {
      message: "must be at least 2 characters.",
    }),
});
type PhoneNumber = z.infer<typeof phoneNumberSchema>;

export { phoneNumberSchema, type PhoneNumber };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emptyStringToNull = (value: unknown) => {
  if (typeof value === "string" && value === "") {
    return null;
  } else {
    return value;
  }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const perfectPhoneNumberSchema = z.object({
  base: phoneNumberSchema.shape.base
    .transform((value) =>
      value.startsWith("0") ? "+49" + value.substring(1) : value,
    )
    .superRefine((arg, ctx) => {
      const hasValidDialCode = CountryDialCodes.some((dialCode) =>
        arg.startsWith(dialCode),
      );

      if (!hasValidDialCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "needs to start with country code",
        });
      }
    }),
  extension: phoneNumberSchema.shape.extension,
});

const phoneNumbersAreEqual = (
  phoneNumber1: PhoneNumber,
  phoneNumber2: PhoneNumber,
) =>
  phoneNumber1.base === phoneNumber2.base &&
  phoneNumber1.extension === phoneNumber2.extension;

export { phoneNumbersAreEqual };

/**
 * Turns a free-form phone number (e.g. "+49 (0) 30 1234-5610") into digits
 * with a leading country code. Numbers without one are assumed to be German.
 */
const normalizePhoneNumber = (input: string) => {
  const digits = input
    .trim()
    // the "(0)" trunk prefix is only dialed without the country code
    .replace(/\(\s*0\s*\)/g, "")
    .replace(/^\+/, "00")
    .replace(/\D/g, "");

  const withCountryCode = digits.startsWith("00")
    ? "+" + digits.substring(2)
    : digits.startsWith("0")
      ? "+49" + digits.substring(1)
      : digits.startsWith("49")
        ? "+" + digits
        : digits;

  // "+49 030 ..." also carries the trunk prefix
  return withCountryCode.replace(/^\+490/, "+49");
};

export { normalizePhoneNumber };
