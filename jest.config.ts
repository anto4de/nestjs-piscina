import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "test",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": ["@swc/jest", { jsc: { target: "es2022" } }],
  },
  // NestJS 12 ships ESM (including import.meta); SWC handles the CJS conversion.
  transformIgnorePatterns: ["/node_modules/(?!@nestjs/)"],
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};

export default config;
