import { defineConfig } from 'vite';
import { cdn, makoo } from '@makoojs/cli';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    makoo({
      app: {
        name: 'bwg-data-stuff',
        version: '0.1.0'
      },
      monkey: {
        userscript: {
          icon: 'https://vitejs.dev/logo.svg',
          namespace: 'noaione/bwg-data-stuff',
          match: ['https://bookwalker.com/*'],
        },
        build: {
          externalGlobals: {
            vue: cdn.jsdelivr('Vue', 'dist/vue.global.min.js')
          }
        },
      },
    }),
  ],
});
