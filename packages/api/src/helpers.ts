import { TRPCError } from "@trpc/server";

export const takeUniqueOrThrow = (message: string) => {
  return <T>(values: T[]): T => {
    if (values.length !== 1)
      throw new Error(`Found non unique or inexistent value: ${message}`);
    return values[0]!;
  };
};

export const findFirstOrThrow = (object_name: string) => {
  return <T>(data: T) => {
    if (!data)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `${object_name} not found`,
      });
    return data;
  };
};
