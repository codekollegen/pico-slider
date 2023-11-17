import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      name: 'pico-slider',
      formats: ['es'],
      entry: 'src/index.ts',
      fileName: (format) => `index.js`,
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
