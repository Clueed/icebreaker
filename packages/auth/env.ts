/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    // comma-separated list of email domains allowed to sign in
    AUTH_ALLOWED_EMAIL_DOMAINS: z
      .string()
      .min(1)
      .transform((domains) =>
        domains
          .split(",")
          .map((domain) => domain.trim().toLowerCase())
          .filter(Boolean),
      ),
    // Local dev only: adds a "dev sign in" that skips Google (see tooling/localdev)
    AUTH_DEV_LOGIN: z.enum(["true", "false"]).optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
