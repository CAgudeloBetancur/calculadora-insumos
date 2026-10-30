import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      }
    }
  }
});