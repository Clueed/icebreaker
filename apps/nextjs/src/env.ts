/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

import { env as authEnv } from "@icebreaker/auth/env";

export const env = createEnv({
  extends: [authEnv, vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    BUILD_ID: z.string().optional(),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    POSTGRES_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SIP_WS_URL: z.string().url().default("wss://sip.sipgate.de"),
    NEXT_PUBLIC_SIP_DOMAIN: z.string().min(1).default("sipgate.de"),
    // comma separated STUN/TURN urls, empty for none (e.g. a SIP server on the local network)
    NEXT_PUBLIC_SIP_ICE_SERVERS: z
      .string()
      .default("stun:stun.l.google.com:19302")
      .transform((value) =>
        value
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
      ),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    BUILD_ID: process.env.BUILD_ID,
    NEXT_PUBLIC_SIP_WS_URL: process.env.NEXT_PUBLIC_SIP_WS_URL,
    NEXT_PUBLIC_SIP_DOMAIN: process.env.NEXT_PUBLIC_SIP_DOMAIN,
    NEXT_PUBLIC_SIP_ICE_SERVERS: process.env.NEXT_PUBLIC_SIP_ICE_SERVERS,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
