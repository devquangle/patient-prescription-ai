import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.js', 'tests/business/**/*.js'],
    exclude: ['tests/e2e/**', 'dist/**', 'playwright-report/**', 'test-results/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      exclude: ['tests/e2e/**', 'dist/**', 'playwright-report/**', 'test-results/**']
    }
  }
});
