import baseConfig from "@icebreaker/eslint-config/base";
import reactConfig from "@icebreaker/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...reactConfig,
];
