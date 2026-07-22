import { defineInjections } from '@makoojs/cli';

export default defineInjections({
  injections: {
    settings: {
      injectAt: 'body',
      component: './settings/app.vue',
    },
  },
});
