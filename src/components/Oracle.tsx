import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { OracleAnswer } from '../lib/rigging';

export interface OracleHandle {
  reveal: (answer: OracleAnswer) => Promise<void>;
}

interface Props {
  onAskStart: () => void;
  onAskEnd: () => void;
  asking: boolean;
  revealing: boolean;
  currentAnswer: OracleAnswer | null;
}

const STAR_COUNT = 18;

// Reveal choreography (ms)
const GATHER_MS = 260;
const FLASH_MS = 900;
const SHIMMER_MS = 1400;
const STAR_MS = 1600;
// Answer text has its own timeline so its fade-in feels ceremonial,
// not synced to the flash.
const TEXT_DELAY_MS = 440; // begins after the gather + into the flash
const TEXT_IN_MS = 1400;   // slow, ceremonial fade-in
const TEXT_HOLD_MS = 1400;
const TEXT_OUT_MS = 780;
const TEXT_TOTAL_MS = TEXT_IN_MS + TEXT_HOLD_MS + TEXT_OUT_MS;

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const Oracle = forwardRef<OracleHandle, Props>(function Oracle(
  { onAskStart, onAskEnd, asking, revealing, currentAnswer },
  ref,
) {
  const poolRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const starfieldRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const angle = (i / STAR_COUNT) * Math.PI * 2 + Math.random() * 0.6;
        const radius = 36 + Math.random() * 26; // percent distance from center
        const size = 4 + Math.random() * 6;
        const delay = Math.random() * 1600;
        const twinkle = 1400 + Math.random() * 1800;
        return {
          id: i,
          style: {
            '--star-size': `${size}px`,
            '--delay': `${delay}ms`,
            '--twinkle': `${twinkle}ms`,
            left: `${50 + Math.cos(angle) * radius * 0.45}%`,
            top: `${50 + Math.sin(angle) * radius * 0.45}%`,
          } as CSSProperties,
        };
      }),
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      reveal: () =>
        new Promise<void>((resolve) => {
          const answerEl = answerRef.current;
          if (!answerEl) {
            resolve();
            return;
          }

          if (prefersReducedMotion()) {
            // Reduced-motion reveal: opacity/brightness only — no transforms,
            // no blur, no parallax. Still gives a clear "the orb is answering"
            // read so the interaction doesn't feel broken.
            const REDUCED_MS = 2800;
            const easing = 'ease-in-out';

            poolRef.current?.animate(
              [
                { filter: 'brightness(1)' },
                { filter: 'brightness(1.35) saturate(1.1)', offset: 0.25 },
                { filter: 'brightness(1.12) saturate(1.05)', offset: 0.75 },
                { filter: 'brightness(1)' },
              ],
              { duration: REDUCED_MS, easing, fill: 'forwards' },
            );

            glowRef.current?.animate(
              [
                { opacity: 0.5 },
                { opacity: 1.5, offset: 0.25 },
                { opacity: 1.2, offset: 0.75 },
                { opacity: 0.5 },
              ],
              { duration: REDUCED_MS, easing, fill: 'forwards' },
            );

            starfieldRef.current?.animate(
              [
                { opacity: 0.3 },
                { opacity: 1, offset: 0.25 },
                { opacity: 1, offset: 0.75 },
                { opacity: 0.3 },
              ],
              { duration: REDUCED_MS, easing, fill: 'forwards' },
            );

            const anim = answerEl.animate(
              [
                { opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { opacity: 1, offset: 0.8 },
                { opacity: 0 },
              ],
              { duration: REDUCED_MS, easing, fill: 'forwards' },
            );
            anim.onfinish = () => {
              anim.cancel();
              resolve();
            };
            return;
          }

          const pool = poolRef.current;
          const glow = glowRef.current;
          const flash = flashRef.current;
          const shimmer = shimmerRef.current;
          const starfield = starfieldRef.current;

          // 1) Pool "gathers" — a quick inhale, then a gentle bloom
          pool?.animate(
            [
              { transform: 'scale(1)', filter: 'brightness(1)' },
              {
                transform: 'scale(0.965)',
                filter: 'brightness(0.82) saturate(1.1)',
                offset: 0.35,
              },
              {
                transform: 'scale(1.02)',
                filter: 'brightness(1.18) saturate(1.15)',
                offset: 0.55,
              },
              { transform: 'scale(1)', filter: 'brightness(1)' },
            ],
            {
              duration: GATHER_MS + FLASH_MS,
              easing: 'cubic-bezier(.3,.8,.2,1)',
              fill: 'forwards',
            },
          );

          // 2) Inner glow surges, holds warmly under the answer, then settles
          glow?.animate(
            [
              { opacity: 0.5, transform: 'scale(1)' },
              { opacity: 1.6, transform: 'scale(1.25)', offset: 0.25 },
              { opacity: 1.2, transform: 'scale(1.12)', offset: 0.6 },
              { opacity: 0.5, transform: 'scale(1)' },
            ],
            {
              duration: GATHER_MS + FLASH_MS + TEXT_HOLD_MS + TEXT_OUT_MS,
              easing: 'cubic-bezier(.3,.8,.2,1)',
              fill: 'forwards',
            },
          );

          // 3) Flash ring — a bright shockwave expanding from the center
          flash?.animate(
            [
              {
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(0.1)',
                borderWidth: '2px',
              },
              {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(0.35)',
                borderWidth: '3px',
                offset: 0.12,
              },
              {
                opacity: 0.4,
                transform: 'translate(-50%, -50%) scale(1.2)',
                borderWidth: '1px',
                offset: 0.65,
              },
              {
                opacity: 0,
                transform: 'translate(-50%, -50%) scale(1.9)',
                borderWidth: '0.5px',
              },
            ],
            {
              delay: GATHER_MS,
              duration: FLASH_MS,
              easing: 'cubic-bezier(.18,.7,.25,1)',
              fill: 'forwards',
            },
          );

          // 4) Shimmer sweep — a conic rotation highlighting the orb's rim
          shimmer?.animate(
            [
              { opacity: 0, transform: 'rotate(0deg) scale(0.9)' },
              { opacity: 0.9, transform: 'rotate(160deg) scale(1)', offset: 0.35 },
              { opacity: 0.5, transform: 'rotate(320deg) scale(1.02)', offset: 0.75 },
              { opacity: 0, transform: 'rotate(420deg) scale(1.05)' },
            ],
            {
              delay: GATHER_MS - 60,
              duration: SHIMMER_MS,
              easing: 'cubic-bezier(.3,.7,.3,1)',
              fill: 'forwards',
            },
          );

          // 5) Starfield bursts into life, twinkles, then fades
          starfield?.animate(
            [
              { opacity: 0, transform: 'scale(0.85)' },
              { opacity: 1, transform: 'scale(1.05)', offset: 0.18 },
              { opacity: 1, transform: 'scale(1)', offset: 0.7 },
              { opacity: 0, transform: 'scale(1.08)' },
            ],
            {
              delay: GATHER_MS + 40,
              duration: STAR_MS,
              easing: 'cubic-bezier(.2,.8,.3,1)',
              fill: 'forwards',
            },
          );

          // 6) Answer text emerges through the flash, holds, then dissolves
          const answerAnim = answerEl.animate(
            [
              {
                opacity: 0,
                transform: 'translateY(16px) scale(0.88)',
                filter: 'blur(10px)',
                letterSpacing: '0.05em',
              },
              {
                opacity: 1,
                transform: 'translateY(0) scale(1.04)',
                filter: 'blur(0)',
                letterSpacing: '0.18em',
                offset: (GATHER_MS + FLASH_MS * 0.55) / TOTAL_MS,
              },
              {
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                filter: 'blur(0)',
                letterSpacing: '0.14em',
                offset: (GATHER_MS + FLASH_MS) / TOTAL_MS,
              },
              {
                opacity: 1,
                transform: 'translateY(-2px) scale(1)',
                filter: 'blur(0)',
                letterSpacing: '0.14em',
                offset: (GATHER_MS + FLASH_MS + HOLD_MS) / TOTAL_MS,
              },
              {
                opacity: 0,
                transform: 'translateY(-12px) scale(0.98)',
                filter: 'blur(6px)',
                letterSpacing: '0.22em',
              },
            ],
            {
              delay: 0,
              duration: TOTAL_MS,
              easing: 'cubic-bezier(.22,.85,.28,1)',
              fill: 'forwards',
            },
          );

          answerAnim.onfinish = () => {
            answerAnim.cancel();
            resolve();
          };
        }),
    }),
    [],
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (revealing) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    onAskStart();
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!asking) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    onAskEnd();
  };

  return (
    <div
      className={`oracle-scene ${asking ? 'asking' : ''} ${
        revealing ? 'revealing' : ''
      }`}
      role="button"
      aria-label="Ask the oracle. Press and hold, then release."
      aria-pressed={asking}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={(e) => {
        if (asking) handlePointerUp(e);
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !asking && !revealing) {
          e.preventDefault();
          onAskStart();
        }
      }}
      onKeyUp={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && asking) {
          e.preventDefault();
          onAskEnd();
        }
      }}
    >
      <div className="oracle-float">
        <div className="oracle-pool" ref={poolRef}>
          <div className="oracle-mist" />
          <div className="oracle-mist oracle-mist-2" />
          <div className="oracle-ripple" />
          <div className="oracle-ripple oracle-ripple-2" />
          <div className="oracle-inner-glow" ref={glowRef} />
          <div className="oracle-starfield" ref={starfieldRef}>
            {stars.map((s) => (
              <span key={s.id} className="oracle-star" style={s.style} />
            ))}
          </div>
          <div className="oracle-shimmer" ref={shimmerRef} />
          <div className="oracle-flash" ref={flashRef} />
          <div className="oracle-answer" ref={answerRef}>
            {currentAnswer ?? ''}
          </div>
        </div>
      </div>
    </div>
  );
});
