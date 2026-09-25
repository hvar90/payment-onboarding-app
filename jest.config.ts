import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(@nestjs)/)'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/main\\.ts$',
    '.*\\.module\\.ts$',
    '.*\\.entity\\.ts$',
    '.*\\.mapper\\.ts$',
    '.*\\.seeder\\.ts$',
    '.*\\.repository\\.ts$',
  ],
};

export default config;