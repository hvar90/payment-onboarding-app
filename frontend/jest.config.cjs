module.exports = {
  preset: 'ts-jest/presets/default-esm', // <--- Obligatorio para proyectos con "type": "module"
  testEnvironment: 'jest-environment-jsdom',
  injectGlobals: true, // <--- Evita el error "jest is not defined"
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true, // <--- Le dice a ts-jest que compile a módulos ES (elimina el error de 'exports')
        tsconfig: '<rootDir>/tsconfig.app.json',
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/App.tsx',
    '!src/store/store.ts',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};