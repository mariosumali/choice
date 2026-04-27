import { WebPlugin } from '@capacitor/core';

import type { SystemVolumePlugin, SystemVolumeReading } from './definitions';

/**
 * Browser fallback. System output volume is not exposed to the web on any
 * supported platform, so we return a neutral reading that every mode maps to
 * "truly random" during local development.
 */
export class SystemVolumeWeb extends WebPlugin implements SystemVolumePlugin {
  async getSystemVolume(): Promise<SystemVolumeReading> {
    return { level: 9 / 16, notches: 9, muted: false };
  }
}
