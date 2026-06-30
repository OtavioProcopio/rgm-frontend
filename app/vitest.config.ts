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
    env: {
      VITE_API_BASE_URL: 'http://localhost:8080/api',
    },
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
        // providers, layouts, rotas e páginas testados por integração E2E
        'src/app/providers/**',
        'src/app/layouts/**',
        'src/app/routes/**',
        'src/App.tsx',
        'src/features/**/pages/**',
        // Componentes e hooks de features específicas testados via Playwright E2E
        'src/features/**/components/**',
        'src/**/hooks/**',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
