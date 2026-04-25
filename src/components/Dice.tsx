import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from 'react';
import type { DiceFace } from '../lib/rigging';

export interface DiceHandle {
  roll: (face: DiceFace) => Promise<void>;
}

interface Props {
  onClick: () => void;
  spinning: boolean;
}

const ROLL_DURATION_MS = 1200;

/**
 * Face placement on the cube (opposite faces sum to 7):
 *   front:  1   back:   6
 *   top:    2   bottom: 5
 *   right:  3   left:   4
 *
 * To bring face N's normal to point toward +Z (camera) we apply:
 *   1 -> identity
 *   6 -> rotateY(180)
 *   2 -> rotateX(-90)        (top face to front)
 *   5 -> rotateX(90)         (bottom face to front)
 *   3 -> rotateY(-90)        (right face to front)
 *   4 -> rotateY(90)         (left face to front)
 *
 * We then compose with a small resting tilt so three faces are visible.
 */
const FACE_REST: Record<DiceFace, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: -90, y: 0 },
  5: { x: 90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
};

const TILT_X = -22;
const TILT_Y = -28;

function pipPositions(face: DiceFace): Array<[number, number]> {
  // 3x3 grid, each coord in [0, 1]
  const C = 0.5;
  const L = 0.22;
  const R = 0.78;
  switch (face) {
    case 1:
      return [[C, C]];
    case 2:
      return [
        [L, L],
        [R, R],
      ];
    case 3:
      return [
        [L, L],
        [C, C],
        [R, R],
      ];
    case 4:
      return [
        [L, L],
        [R, L],
        [L, R],
        [R, R],
      ];
    case 5:
      return [
        [L, L],
        [R, L],
        [C, C],
        [L, R],
        [R, R],
      ];
    case 6:
      return [
        [L, L],
        [R, L],
        [L, C],
        [R, C],
        [L, R],
        [R, R],
      ];
  }
}

function Face({ n }: { n: DiceFace }) {
  const pips = pipPositions(n);
  return (
    <div className={`dice-face dice-face-${n}`}>
      {pips.map(([x, y], i) => (
        <span
          key={i}
          className="dice-pip"
          style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
        />
      ))}
    </div>
  );
}

export const Dice = forwardRef<DiceHandle, Props>(function Dice(
  { onClick, spinning },
  ref,
) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  // Accumulated rotation (absolute), persists across rolls so the cube
  // never visually snaps back to zero.
  const rotRef = useRef({ x: 0, y: 0 });

  useImperativeHandle(
    ref,
    () => ({
      roll: (face) =>
        new Promise<void>((resolve) => {
          const cube = cubeRef.current;
          const shadow = shadowRef.current;

          const from = rotRef.current;
          const target = FACE_REST[face];

          // Compute the shortest-path delta modulo 360, then add several
          // full tumbles on BOTH axes for a believable roll.
          const deltaX = mod360Signed(target.x - (from.x % 360));
          const deltaY = mod360Signed(target.y - (from.y % 360));
          // 2-3 extra spins on X (tumble), 3-4 on Y (rotate)
          const spinX = 360 * (2 + Math.floor(Math.random() * 2));
          const spinY = 360 * (3 + Math.floor(Math.random() * 2));

          const to = {
            x: from.x + deltaX + spinX * signish(deltaX),
            y: from.y + deltaY + spinY * signish(deltaY),
          };

          const finalTransform = cubeTransform(to.x, to.y);

          if (!cube) {
            rotRef.current = to;
            resolve();
            return;
          }

          const anim = cube.animate(
            [
              { transform: cubeTransform(from.x, from.y) },
              {
                transform: cubeTransform(
                  (from.x + to.x) / 2 + 60,
                  (from.y + to.y) / 2 - 40,
                ),
                offset: 0.5,
              },
              { transform: finalTransform },
            ],
            {
              duration: ROLL_DURATION_MS,
              easing: 'cubic-bezier(.18,.85,.28,1)',
              fill: 'forwards',
            },
          );

          if (shadow) {
            shadow.animate(
              [
                { transform: 'translateX(-50%) scale(1, 1)', opacity: 1 },
                {
                  transform: 'translateX(-50%) scale(0.7, 0.55)',
                  opacity: 0.4,
                  offset: 0.5,
                },
                { transform: 'translateX(-50%) scale(1, 1)', opacity: 1 },
              ],
              {
                duration: ROLL_DURATION_MS,
                easing: 'cubic-bezier(.18,.85,.28,1)',
                fill: 'forwards',
              },
            );
          }

          anim.onfinish = () => {
            rotRef.current = to;
            cube.style.transform = finalTransform;
            anim.cancel();
            resolve();
          };
        }),
    }),
    [],
  );

  const initialTransform = cubeTransform(0, 0);

  const sceneStyle = {} as CSSProperties;

  return (
    <div
      className="dice-scene"
      style={sceneStyle}
      onClick={onClick}
      role="button"
      aria-label="Roll the die"
      aria-disabled={spinning}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !spinning) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        ref={cubeRef}
        className="dice-cube"
        style={{ transform: initialTransform }}
      >
        <Face n={1} />
        <Face n={2} />
        <Face n={3} />
        <Face n={4} />
        <Face n={5} />
        <Face n={6} />
      </div>
      <div className="dice-shadow" ref={shadowRef} />
    </div>
  );
});

function cubeTransform(rx: number, ry: number): string {
  return `rotateX(${TILT_X}deg) rotateY(${TILT_Y}deg) rotateX(${rx}deg) rotateY(${ry}deg)`;
}

function mod360Signed(v: number): number {
  // Wrap into (-180, 180]
  let x = ((v % 360) + 360) % 360;
  if (x > 180) x -= 360;
  return x;
}

function signish(v: number): number {
  return v >= 0 ? 1 : -1;
}
