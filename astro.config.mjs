// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// IMPORTANT : remplace cette URL par ton vrai domaine une fois en ligne
// (ex: https://guide-videosurveillance.vercel.app ou ton nom de domaine perso).
// Le sitemap.xml et les balises canoniques dépendent de cette valeur.
const SITE_URL = process.env.SITE_URL || 'https://guide-videosurveillance.vercel.app';

export default defineConfig({
  site: SITE_URL,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/pinterest'),
    }),
  ],
});
