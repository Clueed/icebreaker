import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { Strategy } from "@icebreaker/validators/guessing-strategies";
import { strategySchema } from "@icebreaker/validators/guessing-strategies";
import { dbPhoneCallRatingList } from "@icebreaker/validators/phone-call-rating";

import { encryptedText } from "./helpers/encrypted-text";

const timeStampColumns = {
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "string",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
};

export const Org = pgTable("org", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  selectedGuessId: uuid("selected_guess_id"),
  currentStrategy: jsonb("current_strategy").$type<Strategy>(),
  notes: text("notes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  ...timeStampColumns,
});

export const orgRelation = relations(Org, ({ many, one }) => ({
  guesses: many(Guess),
  selectedGuess: one(Guess, {
    fields: [Org.selectedGuessId],
    references: [Guess.id],
  }),
}));

export const CreateOrgSchema = createInsertSchema(Org, {
  name: z.string().max(256),
  currentStrategy: strategySchema,
  selectedGuessId: z.string().uuid(),
  notes: z.string().array().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Guess
export const Guess = pgTable(
  "guess",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    orgId: uuid("org")
      .notNull()
      .references(() => Org.id, { onDelete: "cascade" }),
    phoneNumber: jsonb("phoneNumber")
      .$type<{ base: string; extension: string }>()
      .notNull()
      .unique(),
    ...timeStampColumns,
  },
  (table) => ({
    phoneNumberIndex: uniqueIndex("phone_number_index").on(table.phoneNumber),
    orgIdIndex: index("org_id_index").on(table.orgId),
  }),
);

export const guessRelation = relations(Guess, ({ many, one }) => ({
  org: one(Org, { fields: [Guess.orgId], references: [Org.id] }),
  phoneCalls: many(PhoneCall),
}));

export const CreateGuessSchema = createInsertSchema(Guess, {
  phoneNumber: z.object({
    base: z.string().max(256),
    extension: z.string().max(256),
  }),
  orgId: z.string().uuid(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// PhoneCall

export const phoneCallRatingEnum = pgEnum("rating_enum", dbPhoneCallRatingList);

export const PhoneCall = pgTable(
  "phone_call",
  {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    sessionId: varchar("sessionId", { length: 256 }).notNull().unique(),
    guessId: uuid("guessId")
      .notNull()
      .references(() => Guess.id, { onDelete: "cascade" }),
    rating: phoneCallRatingEnum("rating"),
    answeredAt: timestamp("answeredAt", {
      mode: "string",
      withTimezone: true,
    }),
    hangupAt: timestamp("hangupAt", {
      mode: "string",
      withTimezone: true,
    }),
    ...timeStampColumns,
  },
  (table) => ({
    sessionIdIndex: uniqueIndex("session_id_index").on(table.sessionId),
    guessIdIndex: index("guess_id_index").on(table.guessId),
    ratingIndex: index("rating_index").on(table.rating),
  }),
);

export const phoneCallRelation = relations(PhoneCall, ({ one }) => ({
  guess: one(Guess, { fields: [PhoneCall.guessId], references: [Guess.id] }),
}));

export const CreatePhoneCallSchema = createInsertSchema(PhoneCall, {
  sessionId: z.string().max(256),
  guessId: z.string().uuid(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// SipCredential
export const SipCredentials = pgTable("sip_credentials", {
  userId: uuid("id")
    .notNull()
    .primaryKey()
    .references(() => User.id, { onDelete: "cascade" }),
  username: encryptedText("username").notNull(),
  password: encryptedText("password").notNull(),
  ...timeStampColumns,
});

export const sipCredentialsRelation = relations(SipCredentials, ({ one }) => ({
  user: one(User, { fields: [SipCredentials.userId], references: [User.id] }),
}));

export const CreateSipCredentialsSchema = createInsertSchema(SipCredentials, {
  username: z.string().min(1).max(256),
  password: z.string().min(1).max(256),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// User

export const User = pgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).notNull(),
  emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
  image: t.varchar({ length: 255 }),
}));

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const Account = pgTable(
  "account",
  (t) => ({
    userId: t
      .uuid()
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: t
      .varchar({ length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: t.varchar({ length: 255 }).notNull(),
    providerAccountId: t.varchar({ length: 255 }).notNull(),
    refresh_token: t.varchar({ length: 255 }),
    access_token: t.text(),
    expires_at: t.integer(),
    token_type: t.varchar({ length: 255 }),
    scope: t.varchar({ length: 255 }),
    id_token: t.text(),
    session_state: t.varchar({ length: 255 }),
  }),
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", (t) => ({
  sessionToken: t.varchar({ length: 255 }).notNull().primaryKey(),
  userId: t
    .uuid()
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: t.timestamp({ mode: "date", withTimezone: true }).notNull(),
}));

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));
