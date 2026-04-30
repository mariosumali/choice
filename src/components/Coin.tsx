import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { CoinFace } from '../lib/rigging';
import type { CoinDesign } from '../lib/coinDesigns';

export interface CoinHandle {
  flip: (face: CoinFace) => Promise<void>;
}

interface Props {
  design: CoinDesign;
  onClick: () => void;
  spinning: boolean;
}

const SPIN_DURATION_MS = 2400;
const REST_TILT_X = 12;
const DECOR_DOT_COUNT = 18;

function faceDecorationDots() {
  const dots: ReactNode[] = [];
  for (let i = 0; i < DECOR_DOT_COUNT; i++) {
    const angle = (i / DECOR_DOT_COUNT) * 360;
    dots.push(
      <span
        key={i}
        className="face-dot"
        style={{ transform: `rotate(${angle}deg) translateY(-42%)` }}
      />,
    );
  }
  return dots;
}

export const Coin = forwardRef<CoinHandle, Props>(function Coin(
  { design, onClick, spinning },
  ref,
) {
  const coinRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);

  const rimSlices = useMemo(
    () =>
      Array.from({ length: design.rimSlices }, (_, i) => {
        const angle = (i / design.rimSlices) * 360;
        return { i, angle, color: design.rimColor(angle) };
      }),
    [design],
  );

  useImperativeHandle(
    ref,
    () => ({
      flip: (face) =>
        new Promise<void>((resolve) => {
          const coin = coinRef.current;
          const shadow = shadowRef.current;
          const from = rotationRef.current;

          const currentMod = ((from % 360) + 360) % 360;
          const currentFace: CoinFace =
            currentMod > 90 && currentMod < 270 ? 'T' : 'H';
          const halfTurn = currentFace === face ? 0 : 180;
          const extraSpins = 360 * (6 + Math.floor(Math.random() * 3));
          const to = from + extraSpins + halfTurn;
          const mid = (from + to) / 2;

          const finalTransform = `rotateX(${REST_TILT_X}deg) rotateY(${to}deg) translateY(0)`;

          if (!coin) {
            rotationRef.current = to;
            resolve();
            return;
          }

          const anim = coin.animate(
            [
              {
                transform: `rotateX(${REST_TILT_X}deg) rotateY(${from}deg) translateY(0)`,
              },
              {
                transform: `rotateX(4deg) rotateY(${mid}deg) translateY(-18%)`,
                offset: 0.5,
              },
              { transform: finalTransform },
            ],
            {
              duration: SPIN_DURATION_MS,
              easing: 'cubic-bezier(.22,.9,.28,1)',
              fill: 'forwards',
            },
          );

          if (shadow) {
            shadow.animate(
              [
                { transform: 'translateX(-50%) scale(1, 1)', opacity: 1 },
                {
                  transform: 'translateX(-50%) scale(0.58, 0.48)',
                  opacity: 0.35,
                  offset: 0.5,
                },
                { transform: 'translateX(-50%) scale(1, 1)', opacity: 1 },
              ],
              {
                duration: SPIN_DURATION_MS,
                easing: 'cubic-bezier(.22,.9,.28,1)',
                fill: 'forwards',
              },
            );
          }

          anim.onfinish = () => {
            rotationRef.current = to;
            coin.style.transform = finalTransform;
            anim.cancel();
            resolve();
          };
        }),
    }),
    [],
  );

  const initialTransform = `rotateX(${REST_TILT_X}deg) rotateY(0deg) translateY(0)`;

  const sceneStyle = {
    '--depth-ratio': design.depthRatio,
    '--slices': design.rimSlices,
  } as CSSProperties;

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    onClick();
  }

  return (
    <div
      className="coin-scene"
      data-design={design.id}
      style={sceneStyle}
      onClick={handleClick}
      role="button"
      aria-label="Flip the coin"
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
        ref={coinRef}
        className="coin"
        style={{ transform: initialTransform }}
      >
        <CoinFaceView face="heads" glyph="H" decor={design.decor} />
        <CoinFaceView face="tails" glyph="T" decor={design.decor} />
        {rimSlices.map(({ i, angle, color }) => (
          <div
            key={i}
            className="coin-rim"
            style={
              {
                '--a': `${angle}deg`,
                backgroundColor: color,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="coin-shadow" ref={shadowRef} />
    </div>
  );
});

function CoinFaceView({
  face,
  glyph,
  decor,
}: {
  face: 'heads' | 'tails';
  glyph: string;
  decor: CoinDesign['decor'];
}) {
  return (
    <div className={`coin-face ${face}`}>
      {decor.rimOuter && <div className="face-rim-outer" />}
      {decor.rimInner && <div className="face-rim-inner" />}
      {decor.dots && <div className="face-dots">{faceDecorationDots()}</div>}
      {decor.bevel && <div className="face-bevel" />}
      {decor.sheen && <div className="face-sheen" />}
      <span className="glyph">{glyph}</span>
    </div>
  );
}
