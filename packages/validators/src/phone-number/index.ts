import { z } from 'zod'

import { CountryDialCodes } from './country-codes'

const emptyStringToNull = (value: unknown) => {
    if (typeof value === 'string' && value === '') {
        return null
    } else {
        return value
    }
}

const notEmptyphoneNumberSchema = z.object({
    base: z
        .string()
        .regex(/^\+?\d+$/, { message: 'can only contain numbers' })
        .min(5, {
            message: 'must be at least 5 characters.',
        })
        .transform((value) =>
            value.startsWith('0') ? '+49' + value.substring(1) : value
        )
        .superRefine((arg, ctx) => {
            const hasValidDialCode = CountryDialCodes.some((dialCode) =>
                arg.startsWith(dialCode)
            )

            if (!hasValidDialCode) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'needs to start with country code',
                })
            }
        }),
    extension: z
        .string()
        .regex(/^\d+$/, { message: 'can only contain numbers' })
        .min(2, {
            message: 'must be at least 2 characters.',
        }),
    guessId: z.string().optional(),
})
type NotEmptyPhoneNumber = z.infer<typeof notEmptyphoneNumberSchema>

const phoneNumberSchema = z.object({
    ...notEmptyphoneNumberSchema.shape,
    base: z.preprocess(
        emptyStringToNull,
        notEmptyphoneNumberSchema.shape.base.nullable()
    ),
    extension: z.preprocess(
        emptyStringToNull,
        notEmptyphoneNumberSchema.shape.extension.nullable()
    ),
})
type PhoneNumber = z.infer<typeof phoneNumberSchema>

const phoneNumbersAreEqual = (
    phoneNumber1: PhoneNumber,
    phoneNumber2: PhoneNumber
) =>
    phoneNumber1.base === phoneNumber2.base &&
    phoneNumber1.extension === phoneNumber2.extension

export {
    notEmptyphoneNumberSchema,
    phoneNumberSchema,
    phoneNumbersAreEqual,
    type NotEmptyPhoneNumber,
    type PhoneNumber,
}
