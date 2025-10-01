const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest', // dùng ts-jest preset
  testEnvironment: 'jest-environment-jsdom', // cần cho test React component
  roots: ['<rootDir>/src'], // root folder của code/test
  transform: {
    ...tsJestTransformCfg, // transform TS/TSX
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // ánh xạ path alias @/ → src/
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(test|spec).[jt]s?(x)'], // pattern file test
};
