import type {
  DefaultSession,
  NextAuthConfig,
  Session as NextAuthSession,
} from "next-auth";
import type { Provider } from "next-auth/providers";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import google from "next-auth/providers/google";

import { db } from "@icebreaker/db/client";
import { Account, Session, User } from "@icebreaker/db/schema";

import { env } from "../env";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const adapter = DrizzleAdapter(db, {
  usersTable: User,
  accountsTable: Account,
  sessionsTable: Session,
});

const isAllowedEmail = (email: string | null | undefined) => {
  const domain = email?.split("@").pop()?.toLowerCase();
  return !!domain && env.AUTH_ALLOWED_EMAIL_DOMAINS.includes(domain);
};

export const providers: Provider[] = [
  google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  }),
];

export const authConfig = {
  adapter,
  secret: env.AUTH_SECRET,
  providers,
  callbacks: {
    session: (opts) => {
      if (!("user" in opts))
        throw new Error("unreachable with session strategy");

      return {
        ...opts.session,
        user: {
          ...opts.session.user,
          id: opts.user.id,
        },
      };
    },
    signIn: ({ profile }) => isAllowedEmail(profile?.email),
    authorized({ auth }) {
      // require auth for every page (exceptions in middleware matcher)
      const isLoggedIn = !!auth?.user;
      if (!isLoggedIn) {
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
} satisfies NextAuthConfig;

export const validateToken = async (
  token: string,
): Promise<NextAuthSession | null> => {
  const sessionToken = token.slice("Bearer ".length);
  const session = await adapter.getSessionAndUser?.(sessionToken);
  return session
    ? {
        user: {
          ...session.user,
        },
        expires: session.session.expires.toISOString(),
      }
    : null;
};

export const invalidateSessionToken = async (token: string) => {
  await adapter.deleteSession?.(token);
};

export const devLoginEnabled =
  env.NODE_ENV !== "production" && env.AUTH_DEV_LOGIN === "true";

const DEV_USER_EMAIL = "dev@example.com";

/**
 * Local dev only: find or create the dev user and open a database session for
 * it, exactly like a successful Google sign-in would (same domain filter).
 */
export const createDevSession = async () => {
  if (!devLoginEnabled) throw new Error("dev login is disabled");
  // denied like a Google sign-in outside AUTH_ALLOWED_EMAIL_DOMAINS
  if (!isAllowedEmail(DEV_USER_EMAIL)) return null;

  const user =
    (await adapter.getUserByEmail?.(DEV_USER_EMAIL)) ??
    (await adapter.createUser?.({
      id: crypto.randomUUID(),
      email: DEV_USER_EMAIL,
      name: "Dev User",
      emailVerified: null,
    }));
  if (!user) throw new Error("could not create dev user");

  const session = await adapter.createSession?.({
    sessionToken: crypto.randomUUID(),
    userId: user.id,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  if (!session) throw new Error("could not create dev session");

  return session;
};
