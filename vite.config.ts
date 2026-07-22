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
      runtime: {
        setup: ['./injections/setup.ts']
      },
      monkey: {
        userscript: {
          icon: 'https://vitejs.dev/logo.svg',
          namespace: 'noaione/bwg-data-stuff',
          match: ['https://bookwalker.com/*', 'https://www.bookwalker.com/*'],
          // Next.js's own router grabs a reference to the original
          // history.pushState/replaceState very early. If our patch (see
          // injections/shared/navigation.ts) installs after that happens
          // (the default document-end/document-idle timing), it never sees
          // calls Next.js makes through its own already-captured reference.
          // document-start runs before any page script, so we patch first.
          'run-at': 'document-start',
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
