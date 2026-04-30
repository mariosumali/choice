import { useRef, useState } from 'react';
import { Coin, type CoinHandle } from '../components/Coin';
import { readCoinVolume } from '../lib/volume';
import { riggedCoin, type CoinFace } from '../lib/rigging';
import type { CoinDesign } from '../lib/coinDesigns';

interface Props {
  design: CoinDesign;
}

export function CoinFlip({ design }: Props) {
  const coinRef = useRef<CoinHandle>(null);
  const [result, setResult] = useState<CoinFace | null>(null);
  const [spinning, setSpinning] = useState(false);

  function oppositeFace(face: CoinFace): CoinFace {
    return face === 'H' ? 'T' : 'H';
  }

  async function flip(invert = false) {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const reading = await readCoinVolume();
    const riggedFace = riggedCoin(reading);
    const face = invert ? oppositeFace(riggedFace) : riggedFace;

    await coinRef.current?.flip(face);

    setResult(face);
    setSpinning(false);
  }

  return (
    <div className="coin-flip-mode" onClick={() => flip(true)}>
      <Coin
        key={design.id}
        ref={coinRef}
        design={design}
        onClick={() => flip()}
        spinning={spinning}
      />
      <div className={`result ${result && !spinning ? 'visible' : ''}`}>
        {result === 'H' ? 'Heads' : result === 'T' ? 'Tails' : '\u00A0'}
      </div>
    </div>
  );
}
