import { useRef, useState } from 'react';
import { Dice, type DiceHandle } from '../components/Dice';
import { readVolume } from '../lib/volume';
import { riggedDice, type DiceFace } from '../lib/rigging';

const RESULT_WORDS: Record<DiceFace, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
};

export function DiceRoll() {
  const diceRef = useRef<DiceHandle>(null);
  const [result, setResult] = useState<DiceFace | null>(null);
  const [rolling, setRolling] = useState(false);

  async function roll() {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    const reading = await readVolume();
    const face = riggedDice(reading);

    await diceRef.current?.roll(face);

    setResult(face);
    setRolling(false);
  }

  return (
    <>
      <Dice ref={diceRef} onClick={roll} spinning={rolling} />
      <div className={`result ${result && !rolling ? 'visible' : ''}`}>
        {result ? RESULT_WORDS[result] : '\u00A0'}
      </div>
    </>
  );
}
