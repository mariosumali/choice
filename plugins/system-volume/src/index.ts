import { registerPlugin } from '@capacitor/core';

import type { SystemVolumePlugin } from './definitions';

const SystemVolume = registerPlugin<SystemVolumePlugin>('SystemVolume', {
  web: () => import('./web').then((m) => new m.SystemVolumeWeb()),
});

export * from './definitions';
export { SystemVolume };
