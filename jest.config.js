export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          "extends": "./tsconfig.json",
          "compilerOptions": {
            "rootDir": ".",              // Change from ./src to . pour inclure tests/
            "outDir": "./dist-tests",    // Différent output pour ne pas polluer dist/
            "noEmit": true               // On ne veut pas émettre de fichiers pour les tests
          },
          "include": ["src/**/*", "tests/**/*"],  // Inclut à la fois src/ et tests/
          "exclude": ["node_modules", "dist", "dist-tests"]
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/apis-gen/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
