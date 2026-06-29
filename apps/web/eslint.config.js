import { baseConfig } from "@labocenter/config/eslint";

export default [
  ...baseConfig,
  {
    ignores: [".react-router/**", "build/**"],
  },
];
