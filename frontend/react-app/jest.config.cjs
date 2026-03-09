/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'commonjs',
          moduleResolution: 'node',
          strict: true,
        },
        diagnostics: false,
      },
    ],
  },
  moduleNameMapper: {
    // Mock para archivos CSS/estilos
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock para archivos estáticos (imágenes, fuentes, etc.)
    '\\.(jpg|jpeg|png|gif|svg|webp|woff|woff2|eot|ttf|otf)$':
      '<rootDir>/src/test/__mocks__/fileMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
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

module.exports = config;
