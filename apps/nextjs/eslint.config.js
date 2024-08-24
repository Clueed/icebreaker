import baseConfig, { restrictEnvAccess } from "@icebreaker/eslint-config/base";
import nextjsConfig from "@icebreaker/eslint-config/nextjs";
import reactConfig from "@icebreaker/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
