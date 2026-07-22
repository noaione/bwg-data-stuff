import { defineInjections } from '@makoojs/cli';

export default defineInjections({
  injections: {
    'hello-world': {
      injectAt: 'body',
      component: './hello-world/app.vue',
    }
  }
});
