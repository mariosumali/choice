import { forwardRef } from 'react';

interface Props {
  items: string[];
  rotation: number;
  spinning: boolean;
  onSpin: () => void;
}

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 4;
const LABEL_RADIUS = RADIUS * 0.64;

const WEDGE_A = '#141414';
const WEDGE_B = '#b8924a';
const TEXT_ON_DARK = '#f5f2ec';
const TEXT_ON_BRASS = '#2a1d08';

function polar(angleDeg: number, radius: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(a), y: CENTER + radius * Math.sin(a) };
}

function wedgePath(startDeg: number, endDeg: number) {
  const start = polar(endDeg, RADIUS);
  const end = polar(startDeg, RADIUS);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function truncate(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max - 1) + '…';
}

export const Wheel = forwardRef<SVGSVGElement, Props>(function Wheel(
  { items, rotation, spinning, onSpin },
  ref,
) {
  const count = items.length;
  const segDeg = 360 / count;
  const maxChars = count <= 4 ? 16 : count <= 6 ? 12 : 9;

  return (
    <div
      className="wheel-stage"
      onClick={() => {
        if (!spinning) onSpin();
      }}
      role="button"
      aria-label="Spin the wheel"
      aria-disabled={spinning}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !spinning) {
          e.preventDefault();
          onSpin();
        }
      }}
    >
      <svg
        className="wheel-pointer"
        viewBox="0 0 22 28"
        aria-hidden="true"
      >
        <path d="M11 28 L1 4 Q11 0 21 4 Z" fill="#141414" />
        <circle cx="11" cy="4" r="2" fill="#f5f2ec" />
      </svg>
      <svg
        ref={ref}
        className="wheel-svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <defs>
          <radialGradient id="wheel-sheen" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="wheel-hub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbf9f3" />
            <stop offset="70%" stopColor="#e9e2d2" />
            <stop offset="100%" stopColor="#b8aa8a" />
          </radialGradient>
        </defs>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 2}
          fill="#141414"
          opacity="0.15"
        />

        {items.map((label, i) => {
          const start = i * segDeg;
          const end = (i + 1) * segDeg;
          const mid = start + segDeg / 2;
          const fill = i % 2 === 0 ? WEDGE_A : WEDGE_B;
          const color = i % 2 === 0 ? TEXT_ON_DARK : TEXT_ON_BRASS;
          const { x, y } = polar(mid, LABEL_RADIUS);
          const fontSize = count <= 4 ? 22 : count <= 6 ? 18 : 15;
          return (
            <g key={i}>
              <path d={wedgePath(start, end)} fill={fill} />
              <text
                x={x}
                y={y}
                transform={`rotate(${mid} ${x} ${y})`}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontFamily="Playfair Display, Georgia, serif"
                fontWeight="600"
                fontSize={fontSize}
                letterSpacing="0.02em"
              >
                {truncate(label, maxChars)}
              </text>
            </g>
          );
        })}

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="url(#wheel-sheen)"
          pointerEvents="none"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(20,20,20,0.22)"
          strokeWidth="1"
          pointerEvents="none"
        />

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS * 0.08}
          fill="url(#wheel-hub)"
          stroke="rgba(20,20,20,0.35)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
});
