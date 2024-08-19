import { z } from "zod";

import { CountryDialCodes } from "./country-codes";

const emptyStringToNull = (value: unknown) => {
  if (typeof value === "string" && value === "") {
    return null;
  } else {
    return value;
  }
};

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

// const phoneNumberSchema = z.object({
//   ...phoneNumberSchema.shape,
//   base: z.preprocess(
//     emptyStringToNull,
//     phoneNumberSchema.shape.base.nullable(),
//   ),
//   extension: z.preprocess(
//     emptyStringToNull,
//     phoneNumberSchema.shape.extension.nullable(),
//   ),
// });
// type PhoneNumber = z.infer<typeof phoneNumberSchema>;

const phoneNumbersAreEqual = (
  phoneNumber1: PhoneNumber,
  phoneNumber2: PhoneNumber,
) =>
  phoneNumber1.base === phoneNumber2.base &&
  phoneNumber1.extension === phoneNumber2.extension;

export { phoneNumberSchema, phoneNumbersAreEqual, type PhoneNumber };
