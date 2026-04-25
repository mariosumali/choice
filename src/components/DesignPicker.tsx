import { coinDesigns, type CoinDesignId } from '../lib/coinDesigns';

interface Props {
  value: CoinDesignId;
  onChange: (id: CoinDesignId) => void;
}

export function DesignPicker({ value, onChange }: Props) {
  return (
    <div
      className="design-picker"
      role="radiogroup"
      aria-label="Coin design"
    >
      {coinDesigns.map((d) => (
        <button
          key={d.id}
          className={`design-swatch ${value === d.id ? 'active' : ''}`}
          data-design={d.id}
          role="radio"
          aria-checked={value === d.id}
          aria-label={d.name}
          title={d.name}
          onClick={() => onChange(d.id)}
        />
      ))}
    </div>
  );
}
