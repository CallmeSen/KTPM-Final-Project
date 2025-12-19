const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
module.exports = {
  projects: [
    // =======================
    // 🔹 UNIT TEST PROJECT
    // =======================
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "jest-environment-jsdom",
      roots: ["<rootDir>/src"],

      transform: {
        ...tsJestTransformCfg,
      },

      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },

      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

      testMatch: [
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "!**/*.it.spec.ts",
        "!**/*.it.test.ts",
      ],

      clearMocks: true,
    },

    // =======================
    // 🔹 INTEGRATION TEST PROJECT
    // =======================
    {
      displayName: "integration",
      preset: "ts-jest",
      testEnvironment: "node",
      roots: ["<rootDir>"],

      transform: {
        ...tsJestTransformCfg,
      },

      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },

      moduleFileExtensions: ["ts", "js", "json"],

      testMatch: [
        "**/*.it.spec.ts",
        "**/*.it.test.ts",
        "**/*.it.test.tsx",
      ],

      testTimeout: 30000,
      clearMocks: false,
    },
  ],
};
