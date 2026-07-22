import { gmMenu } from '@makoojs/cli/monkey';
import { settingsOpen } from './shared/settings';
import { installNavigationWatcher } from './shared/navigation';
import { startGeoblockInjector } from './shared/geoblock';

gmMenu.register('BWG Settings', () => {
  settingsOpen.value = true;
});

installNavigationWatcher();
startGeoblockInjector();
