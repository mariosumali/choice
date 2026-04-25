import type { Mode } from '../App';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const TABS: Array<{ id: Mode; label: string }> = [
  { id: 'coin', label: 'Coin' },
  { id: 'wheel', label: 'Wheel' },
  { id: 'dice', label: 'Dice' },
  { id: 'oracle', label: 'Oracle' },
];

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Mode">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={mode === t.id}
          className={mode === t.id ? 'active' : ''}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
