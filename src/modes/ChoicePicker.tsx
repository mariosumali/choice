import { useRef, useState } from 'react';
import { Wheel } from '../components/Wheel';
import { readWheelVolume } from '../lib/volume';
import { riggedWheel } from '../lib/rigging';

const MAX_CHOICES = 8;
const SPIN_DURATION_MS = 2000;

type Phase = 'setup' | 'wheel';

export function ChoicePicker() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputs, setInputs] = useState<string[]>(() =>
    Array.from({ length: MAX_CHOICES }, () => ''),
  );
  const [items, setItems] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const resultRef = useRef<string | null>(null);

  const filled = inputs.filter((s) => s.trim().length > 0);
  const canStart = filled.length >= 2;

  function startWheel() {
    if (!canStart) return;
    setItems(filled.map((s) => s.trim()));
    setResult(null);
    setRotation(0);
    setPhase('wheel');
  }

  function backToSetup() {
    if (spinning) return;
    setPhase('setup');
    setResult(null);
    setRotation(0);
  }

  async function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const reading = await readWheelVolume(items.length);
    const index = riggedWheel(reading, items.length);
    resultRef.current = items[index];

    const segDeg = 360 / items.length;
    const segCenter = (index + 0.5) * segDeg;

    const currentMod = ((rotation % 360) + 360) % 360;
    const targetMod = (360 - segCenter + 360) % 360;
    let delta = (targetMod - currentMod + 360) % 360;
    const extraSpins = 360 * (4 + Math.floor(Math.random() * 2));
    const next = rotation + extraSpins + delta;

    requestAnimationFrame(() => setRotation(next));

    window.setTimeout(() => {
      setResult(resultRef.current);
      setSpinning(false);
    }, SPIN_DURATION_MS);
  }

  if (phase === 'setup') {
    return (
      <div className="wheel-setup">
        <h2 className="heading">Enter up to eight choices</h2>
        {inputs.map((value, i) => (
          <div key={i} className="wheel-input">
            <div className="num">{i + 1}</div>
            <input
              type="text"
              value={value}
              maxLength={40}
              placeholder={i < 2 ? 'Required' : 'Optional'}
              onChange={(e) => {
                const next = inputs.slice();
                next[i] = e.target.value;
                setInputs(next);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canStart) startWheel();
              }}
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
            />
          </div>
        ))}
        <button
          className="wheel-cta"
          disabled={!canStart}
          onClick={startWheel}
        >
          Spin
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="wheel-back"
        onClick={backToSetup}
        aria-label="Edit choices"
      >
        Edit
      </button>
      <Wheel
        items={items}
        rotation={rotation}
        spinning={spinning}
        onSpin={spin}
      />
      <div className={`result ${result && !spinning ? 'visible' : ''}`}>
        {result ?? '\u00A0'}
      </div>
    </>
  );
}
