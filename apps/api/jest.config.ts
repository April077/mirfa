import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'], // <- important
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};

export default config;
