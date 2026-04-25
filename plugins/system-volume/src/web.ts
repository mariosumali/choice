import { WebPlugin } from '@capacitor/core';

import type { SystemVolumePlugin, SystemVolumeReading } from './definitions';

/**
 * Browser fallback. System output volume is not exposed to the web on any
 * supported platform, so we return a neutral mid-level reading so the UI
 * runs in "truly random" mode during local development.
 */
export class SystemVolumeWeb extends WebPlugin implements SystemVolumePlugin {
  async getSystemVolume(): Promise<SystemVolumeReading> {
    return { level: 0.5, notches: 8, muted: false };
  }
}
