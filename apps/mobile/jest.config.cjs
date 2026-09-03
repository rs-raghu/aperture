module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: ["src/features/education/**/*.{ts,tsx}"],
  moduleNameMapper: {
    "^@aperture/education$": "<rootDir>/../../packages/education/dist/index.js",
    "^@aperture/education-memory$": "<rootDir>/../../packages/education-memory/dist/index.js",
    "^@aperture/validation$": "<rootDir>/../../packages/validation/dist/index.js",
  },
};
