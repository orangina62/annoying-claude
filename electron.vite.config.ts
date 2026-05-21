import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main',
      lib: { entry: 'src/main/index.ts' },
      rollupOptions: {
        // Native + cjs deps that must stay external (Vite can't bundle them
        // and we want Node to require them from node_modules at runtime).
        external: ['electron', '@nut-tree-fork/nut-js'],
      },
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        external: ['electron'],
        input: {
          index: resolve('src/preload/index.ts'),
          welcome: resolve('src/preload/welcome.ts'),
          popup: resolve('src/preload/popup.ts'),
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          claude: resolve('src/renderer/claude/index.html'),
          welcome: resolve('src/renderer/welcome/index.html'),
          popup: resolve('src/renderer/popup/index.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
      },
    },
  },
});
