import { relations, sql, Table } from "drizzle-orm";
import {
  index,
  integer,
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

import { Strategy, strategySchema } from "@acme/validators/guessing-strategies";

import { encryptedText } from "./helpers/encrypted-text";

const timeStampColumns = {
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
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
    orgId: uuid("org").notNull(),
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

const phoneCallStateList = [
  "Initial",
  "Establishing",
  "Established",
  "Terminating",
  "Terminated",
] as const;
export const phoneCallStateEnum = pgEnum("state", phoneCallStateList);

export const PhoneCall = pgTable("phone_call", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  sessionId: varchar("sessionId", { length: 256 }).notNull(),
  guessId: uuid("guessId").notNull(),
  state: phoneCallStateEnum("state").notNull(),
  ...timeStampColumns,
});

export const phoneCallRelation = relations(PhoneCall, ({ one }) => ({
  guess: one(Guess, { fields: [PhoneCall.guessId], references: [Guess.id] }),
}));

export const CreatePhoneCallSchema = createInsertSchema(PhoneCall, {
  sessionId: z.string().max(256),
  guessId: z.string().uuid(),
  state: z.enum(phoneCallStateList),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// SipCredential
export const SipCredentials = pgTable("sip_credentials", {
  userId: uuid("id").notNull().primaryKey(),
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
  createdAt: true,
  updatedAt: true,
});

// Reference
export const Post = pgTable("post", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("name", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// UserSettings

export const UserSettings = pgTable("user_settings", {
  userId: uuid("user_id").notNull().primaryKey(),
  currentPhoneCallId: uuid("current_phone_call_id"),
  ...timeStampColumns,
});

export const CreateUserSettingsSchema = createInsertSchema(UserSettings, {
  currentPhoneCallId: z.string().uuid(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const UserSettingsRelations = relations(UserSettings, ({ one }) => ({
  user: one(User, { fields: [UserSettings.userId], references: [User.id] }),
  currentPhoneCall: one(PhoneCall, {
    fields: [UserSettings.currentPhoneCallId],
    references: [PhoneCall.id],
  }),
}));

// User

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
});

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const Account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));
