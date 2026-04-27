import { Capacitor } from '@capacitor/core';
import { SystemVolume, type SystemVolumeReading } from 'system-volume';
import {
  readMotionCoinReading,
  readMotionDiceReading,
  readMotionOracleReading,
  readMotionWheelReading,
} from './motion';

export type VolumeReading = SystemVolumeReading;

const RANDOM_ZONE_READING: VolumeReading = {
  level: 9 / 16,
  notches: 9,
  muted: false,
};

function readingFromNotches(notches: number): VolumeReading {
  const clamped = Math.min(Math.max(Math.round(notches), 0), 16);
  return {
    level: clamped / 16,
    notches: clamped,
    muted: clamped === 0,
  };
}

function readLocalOverride(): VolumeReading | null {
  if (typeof window === 'undefined') return null;

  const { hostname, search } = window.location;
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]';

  if (!isLocal) return null;

  const params = new URLSearchParams(search);
  const queryValue = params.get('volumeNotches') ?? params.get('notches');
  let storedValue: string | null = null;
  try {
    storedValue = window.localStorage.getItem('choice.volumeNotches');
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  const rawValue = queryValue ?? storedValue;
  if (rawValue === null) return null;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) return null;

  if (queryValue !== null) {
    try {
      window.localStorage.setItem('choice.volumeNotches', String(parsed));
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }

  return readingFromNotches(parsed);
}

async function readSystemVolume(): Promise<VolumeReading> {
  try {
    const reading = await SystemVolume.getSystemVolume();
    return reading;
  } catch {
    return RANDOM_ZONE_READING;
  }
}

export async function readVolume(): Promise<VolumeReading> {
  const override = readLocalOverride();
  if (override) return override;

  return readSystemVolume();
}

export async function readCoinVolume(): Promise<VolumeReading> {
  const override = readLocalOverride();
  if (override) return override;

  if (!Capacitor.isNativePlatform()) {
    const motionReading = await readMotionCoinReading();
    if (motionReading) return motionReading;
  }

  return readSystemVolume();
}

export async function readWheelVolume(count: number): Promise<VolumeReading> {
  const override = readLocalOverride();
  if (override) return override;

  if (!Capacitor.isNativePlatform()) {
    const motionReading = await readMotionWheelReading(count);
    if (motionReading) return motionReading;
  }

  return readSystemVolume();
}

export async function readDiceVolume(): Promise<VolumeReading> {
  const override = readLocalOverride();
  if (override) return override;

  if (!Capacitor.isNativePlatform()) {
    const motionReading = await readMotionDiceReading();
    if (motionReading) return motionReading;
  }

  return readSystemVolume();
}

export async function readOracleVolume(): Promise<VolumeReading> {
  const override = readLocalOverride();
  if (override) return override;

  if (!Capacitor.isNativePlatform()) {
    const motionReading = await readMotionOracleReading();
    if (motionReading) return motionReading;
  }

  return readSystemVolume();
}
