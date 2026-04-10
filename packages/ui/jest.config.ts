import type { Config } from 'jest';

const config: Config = {
  displayName: 'ui',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default config;
