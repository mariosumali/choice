import { SystemVolume, type SystemVolumeReading } from 'system-volume';

export type VolumeReading = SystemVolumeReading;

export async function readVolume(): Promise<VolumeReading> {
  try {
    const reading = await SystemVolume.getSystemVolume();
    return reading;
  } catch {
    return { level: 0.5, notches: 8, muted: false };
  }
}
