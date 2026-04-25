export interface SystemVolumeReading {
  /** Raw output volume in [0.0, 1.0]. */
  level: number;
  /** Integer notch count, rounded from level * 16 (iOS default step count). */
  notches: number;
  /** True when level is effectively zero. */
  muted: boolean;
}

export interface SystemVolumePlugin {
  getSystemVolume(): Promise<SystemVolumeReading>;
}
