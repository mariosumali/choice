import type { VolumeReading } from './volume';

type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

interface OrientationSnapshot {
  alpha: number | null;
  beta: number;
  gamma: number;
}

const TILT_THRESHOLD_DEGREES = 18;
const MOTION_TIMEOUT_MS = 450;

let listening = false;
let permissionState: PermissionState | 'prompt' = 'prompt';
let latestOrientation: OrientationSnapshot | null = null;

function readingFromNotches(notches: number): VolumeReading {
  const clamped = Math.min(Math.max(Math.round(notches), 0), 16);
  return {
    level: clamped / 16,
    notches: clamped,
    muted: clamped === 0,
  };
}

function randomCoinReading(): VolumeReading {
  return readingFromNotches(2);
}

function randomWheelReading(): VolumeReading {
  return readingFromNotches(9);
}

function randomDiceReading(): VolumeReading {
  return readingFromNotches(7);
}

function randomOracleReading(): VolumeReading {
  return readingFromNotches(3);
}

function snapshotFromEvent(
  event: DeviceOrientationEvent,
): OrientationSnapshot | null {
  const compassHeading = (event as OrientationEventWithCompass)
    .webkitCompassHeading;
  const alpha =
    typeof compassHeading === 'number' && Number.isFinite(compassHeading)
      ? compassHeading
      : typeof event.alpha === 'number' && Number.isFinite(event.alpha)
        ? event.alpha
        : null;

  if (
    typeof event.beta !== 'number' ||
    typeof event.gamma !== 'number' ||
    !Number.isFinite(event.beta) ||
    !Number.isFinite(event.gamma)
  ) {
    return null;
  }

  return {
    alpha,
    beta: event.beta,
    gamma: event.gamma,
  };
}

function handleOrientation(event: DeviceOrientationEvent) {
  const snapshot = snapshotFromEvent(event);
  if (snapshot) latestOrientation = snapshot;
}

async function requestOrientationAccess(): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    typeof window.DeviceOrientationEvent === 'undefined'
  ) {
    return false;
  }

  const OrientationEvent =
    window.DeviceOrientationEvent as OrientationEventWithPermission;

  if (typeof OrientationEvent.requestPermission === 'function') {
    if (permissionState === 'granted') return true;
    if (permissionState === 'denied') return false;

    try {
      permissionState = await OrientationEvent.requestPermission();
    } catch {
      permissionState = 'denied';
    }

    return permissionState === 'granted';
  }

  permissionState = 'granted';
  return true;
}

function startOrientationListener() {
  if (listening) return;
  window.addEventListener('deviceorientation', handleOrientation, {
    passive: true,
  });
  listening = true;
}

async function waitForOrientation(): Promise<OrientationSnapshot | null> {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (value: OrientationSnapshot | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('deviceorientation', onOrientation);
      window.clearTimeout(timeout);
      resolve(value);
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      const snapshot = snapshotFromEvent(event);
      if (!snapshot) return;

      latestOrientation = snapshot;
      finish(snapshot);
    };

    const timeout = window.setTimeout(
      () => finish(latestOrientation),
      MOTION_TIMEOUT_MS,
    );
    window.addEventListener('deviceorientation', onOrientation, {
      passive: true,
    });
  });
}

async function readOrientationSnapshot(): Promise<OrientationSnapshot | null> {
  const canReadOrientation = await requestOrientationAccess();
  if (!canReadOrientation) return null;

  startOrientationListener();
  return waitForOrientation();
}

function screenRotationDegrees(): number {
  const angle = window.screen.orientation?.angle;
  return typeof angle === 'number' && Number.isFinite(angle) ? angle : 0;
}

function rotationSector(
  snapshot: OrientationSnapshot,
  count: number,
): number | null {
  if (count <= 0 || snapshot.alpha === null) return null;

  const normalized =
    ((snapshot.alpha + screenRotationDegrees()) % 360 + 360) % 360;
  const sectorSize = 360 / count;
  return Math.floor((normalized + sectorSize / 2) / sectorSize) % count;
}

function coinReadingFromOrientation(snapshot: OrientationSnapshot): VolumeReading {
  if (snapshot.beta <= -TILT_THRESHOLD_DEGREES) {
    return readingFromNotches(0); // Tilted forward, away from you: heads.
  }

  if (snapshot.beta >= TILT_THRESHOLD_DEGREES) {
    return readingFromNotches(1); // Tilted back, toward you: tails.
  }

  return randomCoinReading(); // Flat enough to feel neutral.
}

export async function readMotionCoinReading(): Promise<VolumeReading | null> {
  const snapshot = await readOrientationSnapshot();
  if (!snapshot) return null;

  return coinReadingFromOrientation(snapshot);
}

export async function readMotionWheelReading(
  count: number,
): Promise<VolumeReading | null> {
  const snapshot = await readOrientationSnapshot();
  if (!snapshot) return null;

  const sector = rotationSector(snapshot, count);
  if (sector === null) return randomWheelReading();

  return readingFromNotches(sector + 1);
}

export async function readMotionDiceReading(): Promise<VolumeReading | null> {
  const snapshot = await readOrientationSnapshot();
  if (!snapshot) return null;

  const sector = rotationSector(snapshot, 6);
  if (sector === null) return randomDiceReading();

  return readingFromNotches(sector + 1);
}

export async function readMotionOracleReading(): Promise<VolumeReading | null> {
  const snapshot = await readOrientationSnapshot();
  if (!snapshot) return null;

  if (snapshot.beta <= -TILT_THRESHOLD_DEGREES) {
    return readingFromNotches(0); // Forward: yes.
  }

  if (snapshot.beta >= TILT_THRESHOLD_DEGREES) {
    return readingFromNotches(1); // Back: no.
  }

  if (Math.abs(snapshot.gamma) >= TILT_THRESHOLD_DEGREES) {
    return readingFromNotches(2); // Either side: maybe.
  }

  return randomOracleReading();
}
