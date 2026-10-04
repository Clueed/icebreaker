import { cache } from "react";
import NextAuth from "next-auth";

import { authConfig, providers } from "./config";

export type { Session } from "next-auth";

const { handlers, auth: defaultAuth, signIn, signOut } = NextAuth(authConfig);

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to next-auth's default `auth()` function and only call it once per request
 */
const auth = cache(defaultAuth);

export { handlers, auth, signIn, signOut };

export {
  createDevSession,
  devLoginEnabled,
  invalidateSessionToken,
  validateToken,
} from "./config";

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");
