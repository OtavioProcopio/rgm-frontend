import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['node_modules', 'dist', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/app/router.tsx',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/shared/lib/cn.ts',
        // arquivos de só tipos — sem código executável
        'src/shared/types/**',
        'src/**/types/**',
        // API files — dependem de fetch/HTTP, testados via mocks nos hooks
        'src/shared/api/httpClient.ts',
        'src/**/api/**Api.ts',
        // test utils — não são código da app
        'src/test-utils/**',
        // providers e layouts testados por integração E2E
        'src/app/providers/AuthProvider.tsx',
        'src/app/providers/ThemeProvider.tsx',
        'src/app/layouts/**',
        'src/App.tsx',
      ],
      thresholds: {
        lines: 65,
        functions: 60,
        branches: 68,
        statements: 65,
      },
    },
  },
});
