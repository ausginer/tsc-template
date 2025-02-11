import { fileURLToPath, pathToFileURL } from 'node:url';
import { defineConfig } from 'vitest/config';

export const isCI = process.env.CI === 'true';

export const cwd = pathToFileURL(`${process.cwd()}/`);

export default defineConfig({
  build: {
    target: 'esnext',
  },
  cacheDir: '.vite',
  esbuild: {
    supported: {
      decorators: false,
      'top-level-await': true,
    },
  },
  test: {
    coverage: {
      enabled: false,
      all: true,
      provider: 'v8',
      reportsDirectory: fileURLToPath(new URL('.coverage/', cwd)),
      clean: true,
      reporter: isCI ? ['lcov'] : ['html'],
    },
    includeTaskLocation: !isCI,
  },
});
