import type { SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { TRPCError } from "@trpc/server";
import { getTableColumns, sql } from "drizzle-orm";

import type { AnyColumn, GetColumnData } from "@icebreaker/db";

export const takeUniqueOrThrow = (message: string) => {
  return <T>(values: T[]): T => {
    if (!values[0])
      throw new Error(`Found non unique or inexistent value: ${message}`);
    return values[0];
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

export const buildConflictUpdateColumns = <
  T extends PgTable | SQLiteTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const col = cls[column];
      if (!col) {
        throw new Error(
          `Column ${String(column)} not found in ${table._.name}`,
        );
      }
      const colName = col.name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

export const jsonAgg = <Column extends AnyColumn>(column: Column) => {
  return sql<
    GetColumnData<Column, "raw">[]
  >`json_agg(distinct ${sql`${column}`})`;
};

export const arrayAggNotNull = <Column extends AnyColumn>(column: Column) => {
  return sql<
    GetColumnData<Column, "raw">[]
  >`array_agg(distinct ${sql`${column}`}) filter (where ${column} is not null)`;
};
