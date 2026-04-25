import type { VolumeReading } from './volume';

export type CoinFace = 'H' | 'T';

/**
 * Coin rigging per PRD:
 *   0 notches  -> HEADS
 *   1 notch    -> TAILS
 *   2+ notches -> truly random
 */
export function riggedCoin(reading: VolumeReading): CoinFace {
  const n = reading.muted ? 0 : reading.notches;
  if (n === 0) return 'H';
  if (n === 1) return 'T';
  return Math.random() < 0.5 ? 'H' : 'T';
}

/**
 * Wheel rigging per PRD:
 *   0 notches  -> truly random
 *   1..8       -> forces that choice index (1-based)
 *   9+         -> truly random
 *
 * When the user has fewer than 8 choices but the rigged notch points past
 * the end, we clamp to the last available choice.
 */
export function riggedWheel(reading: VolumeReading, count: number): number {
  if (count <= 0) throw new Error('riggedWheel requires at least one choice');
  const n = reading.muted ? 0 : reading.notches;
  if (n === 0 || n >= 9) {
    return Math.floor(Math.random() * count);
  }
  return Math.min(n, count) - 1;
}

export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Dice rigging per PRD:
 *   0 notches  -> always 6
 *   1..6       -> that face
 *   7+         -> truly random
 */
export function riggedDice(reading: VolumeReading): DiceFace {
  const n = reading.muted ? 0 : reading.notches;
  if (n === 0) return 6;
  if (n >= 1 && n <= 6) return n as DiceFace;
  return (1 + Math.floor(Math.random() * 6)) as DiceFace;
}

export type OracleAnswer = 'YES' | 'NO' | 'MAYBE';

/**
 * Oracle rigging per PRD:
 *   0 notches -> YES
 *   1 notch   -> NO
 *   2 notches -> MAYBE
 *   3+        -> truly random (equal weight)
 */
export function riggedOracle(reading: VolumeReading): OracleAnswer {
  const n = reading.muted ? 0 : reading.notches;
  if (n === 0) return 'YES';
  if (n === 1) return 'NO';
  if (n === 2) return 'MAYBE';
  const r = Math.random();
  if (r < 1 / 3) return 'YES';
  if (r < 2 / 3) return 'NO';
  return 'MAYBE';
}
