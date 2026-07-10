import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (name: string) => fileURLToPath(new URL(`./${name}.html`, import.meta.url));

export default defineConfig({
  base: '/bee/',
  build: {
    rollupOptions: {
      input: {
        main: page('index'),
        gallery: page('gallery'),
        stories: page('stories'),
        ask: page('ask'),
        game: page('game'),
        about: page('about'),
        admin: page('admin')
      }
    }
  }
});
