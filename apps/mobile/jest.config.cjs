module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: ["src/features/{education,health}/**/*.{ts,tsx}"],
  moduleNameMapper: {
    "^@aperture/education$": "<rootDir>/../../packages/education/dist/index.js",
    "^@aperture/education-memory$": "<rootDir>/../../packages/education-memory/dist/index.js",
    "^@aperture/health$": "<rootDir>/../../packages/health/dist/index.js",
    "^@aperture/health-memory$": "<rootDir>/../../packages/health-memory/dist/index.js",
    "^@aperture/validation$": "<rootDir>/../../packages/validation/dist/index.js",
  },
};
