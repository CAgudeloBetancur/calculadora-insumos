// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://calculadorainsumos.com',
  output: 'static',
  build: {format: 'directory'},
  integrations: [preact()]
});