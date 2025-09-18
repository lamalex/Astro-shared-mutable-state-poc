// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import deferredFootnotesIntegration from './src/integrations/deferred-footnotes.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), deferredFootnotesIntegration()]
});