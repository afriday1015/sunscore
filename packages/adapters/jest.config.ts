import type { Config } from 'jest';

const config: Config = {
  displayName: 'adapters',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default config;
