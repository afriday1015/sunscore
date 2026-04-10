import type { Config } from 'jest';

const config: Config = {
  projects: [
    '<rootDir>/packages/ui',
    '<rootDir>/packages/adapters',
    '<rootDir>/packages/domain',
  ],
};

export default config;
