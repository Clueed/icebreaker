import { neonConfig } from "@neondatabase/serverless";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import { env } from "../env";
import * as schema from "./schema";

// Local dev (tooling/localdev): reach plain Postgres through an unencrypted
// WebSocket proxy instead of Neon/Supabase's TLS endpoint.
if (env.POSTGRES_WS_PROXY) {
  const wsProxy = env.POSTGRES_WS_PROXY;
  neonConfig.wsProxy = () => wsProxy;
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

export const db = drizzle(sql, {
  schema,
  logger: true,
  casing: "snake_case",
});

export type DB = typeof db;
