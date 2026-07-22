import { gmStorage } from '@makoojs/cli/monkey';
import { Store } from './store';

export const hostUrl = new Store(gmStorage.get<string>('hostUrl', 'https://bwg-data-api.serik.at'));
export const autoCheck = new Store(gmStorage.get<boolean>('autoCheck', true));

// Toggled by the "BWG Settings" menu command (see injections/setup.ts) and
// read by injections/settings/app.vue to show/hide the modal.
export const settingsOpen = new Store(false);

hostUrl.subscribe((value) => gmStorage.set('hostUrl', value));
autoCheck.subscribe((value) => gmStorage.set('autoCheck', value));
