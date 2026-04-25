import { useEffect, useState } from 'react';
import { CoinFlip } from './modes/CoinFlip';
import { ChoicePicker } from './modes/ChoicePicker';
import { DiceRoll } from './modes/Dice';
import { OracleMode } from './modes/Oracle';
import { ModeToggle } from './components/ModeToggle';
import { DesignPicker } from './components/DesignPicker';
import {
  coinDesigns,
  defaultDesignId,
  getDesign,
  type CoinDesignId,
} from './lib/coinDesigns';

export type Mode = 'coin' | 'wheel' | 'dice' | 'oracle';

const DESIGN_STORAGE_KEY = 'coin.design';

function readStoredDesign(): CoinDesignId {
  if (typeof window === 'undefined') return defaultDesignId;
  try {
    const stored = window.localStorage.getItem(DESIGN_STORAGE_KEY);
    if (stored && coinDesigns.some((d) => d.id === stored)) {
      return stored as CoinDesignId;
    }
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  return defaultDesignId;
}

export function App() {
  const [mode, setMode] = useState<Mode>('coin');
  const [designId, setDesignId] = useState<CoinDesignId>(readStoredDesign);

  useEffect(() => {
    try {
      window.localStorage.setItem(DESIGN_STORAGE_KEY, designId);
    } catch {
      // ignore storage errors
    }
  }, [designId]);

  const design = getDesign(designId);

  return (
    <div className="app">
      <div className="topbar">
        <ModeToggle mode={mode} onChange={setMode} />
        {mode === 'coin' && (
          <DesignPicker value={designId} onChange={setDesignId} />
        )}
      </div>
      <div className="stage">
        {mode === 'coin' && <CoinFlip design={design} />}
        {mode === 'wheel' && <ChoicePicker />}
        {mode === 'dice' && <DiceRoll />}
        {mode === 'oracle' && <OracleMode />}
      </div>
      <div className="footer" />
    </div>
  );
}
