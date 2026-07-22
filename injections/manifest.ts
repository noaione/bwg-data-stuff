import { defineInjections } from '@makoojs/cli';

export default defineInjections({
  injections: {
    settings: {
      // Not 'body': the script now runs at document-start (see
      // vite.config.ts), so document.body doesn't exist yet when this
      // module's search starts, and it would just time out waiting for it.
      // <html> exists as soon as parsing begins, well before <body>.
      injectAt: 'html',
      component: './settings/app.vue',
    },
  },
});
