import { useRef, useState } from 'react';
import { Oracle, type OracleHandle } from '../components/Oracle';
import { readVolume } from '../lib/volume';
import { riggedOracle, type OracleAnswer } from '../lib/rigging';

export function OracleMode() {
  const oracleRef = useRef<OracleHandle>(null);
  const [asking, setAsking] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [answer, setAnswer] = useState<OracleAnswer | null>(null);

  function startAsk() {
    if (revealing) return;
    setAsking(true);
    setAnswer(null);
  }

  async function endAsk() {
    if (!asking || revealing) return;
    setAsking(false);
    setRevealing(true);

    const reading = await readVolume();
    const a = riggedOracle(reading);
    setAnswer(a);

    // Let React commit the answer text before starting the reveal animation.
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    await oracleRef.current?.reveal(a);

    setAnswer(null);
    setRevealing(false);
  }

  return (
    <Oracle
      ref={oracleRef}
      onAskStart={startAsk}
      onAskEnd={endAsk}
      asking={asking}
      revealing={revealing}
      currentAnswer={answer}
    />
  );
}
