export type CoinDesignId =
  | 'ivory'
  | 'brass'
  | 'obsidian'
  | 'jade'
  | 'bronze'
  | 'porcelain'
  | 'neon';

export interface CoinDesign {
  id: CoinDesignId;
  name: string;
  depthRatio: number;
  rimSlices: number;
  rimColor: (angleDeg: number) => string;
  decor: {
    rimOuter: boolean;
    rimInner: boolean;
    dots: boolean;
    bevel: boolean;
    sheen: boolean;
  };
}

const LIGHT = 35;

function light(angleDeg: number): number {
  const rad = ((angleDeg - LIGHT) * Math.PI) / 180;
  return Math.max(0.08, Math.cos(rad) * 0.5 + 0.5);
}

export const coinDesigns: readonly CoinDesign[] = [
  {
    id: 'ivory',
    name: 'Ivory',
    depthRatio: 0.05,
    rimSlices: 60,
    rimColor: (a) => {
      const l = light(a);
      return `hsl(40, ${10 + 8 * l}%, ${62 + 22 * l}%)`;
    },
    decor: {
      rimOuter: false,
      rimInner: false,
      dots: false,
      bevel: true,
      sheen: true,
    },
  },
  {
    id: 'brass',
    name: 'Brass',
    depthRatio: 0.062,
    rimSlices: 56,
    rimColor: (a) => {
      const l = light(a);
      return `hsl(38, ${48 + 12 * l}%, ${22 + 36 * l}%)`;
    },
    decor: {
      rimOuter: true,
      rimInner: true,
      dots: false,
      bevel: true,
      sheen: true,
    },
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    depthRatio: 0.05,
    rimSlices: 64,
    rimColor: (a) => {
      const l = light(a);
      return `hsl(42, ${8 + 10 * l}%, ${3 + 9 * l}%)`;
    },
    decor: {
      rimOuter: true,
      rimInner: false,
      dots: false,
      bevel: true,
      sheen: false,
    },
  },
  {
    id: 'jade',
    name: 'Jade',
    depthRatio: 0.056,
    rimSlices: 52,
    rimColor: (a) => {
      const l = light(a);
      return `hsl(152, ${26 + 14 * l}%, ${15 + 26 * l}%)`;
    },
    decor: {
      rimOuter: true,
      rimInner: true,
      dots: false,
      bevel: true,
      sheen: false,
    },
  },
  {
    id: 'bronze',
    name: 'Bronze',
    depthRatio: 0.074,
    rimSlices: 48,
    rimColor: (a) => {
      const l = light(a);
      const greenish = Math.sin((a * Math.PI) / 36) > 0.82;
      if (greenish) {
        return `hsl(148, ${24 + 12 * l}%, ${14 + 18 * l}%)`;
      }
      return `hsl(28, ${34 + 12 * l}%, ${10 + 22 * l}%)`;
    },
    decor: {
      rimOuter: true,
      rimInner: true,
      dots: false,
      bevel: true,
      sheen: false,
    },
  },
  {
    id: 'porcelain',
    name: 'Porcelain',
    depthRatio: 0.042,
    rimSlices: 60,
    rimColor: (a) => {
      const l = light(a);
      return `hsl(42, ${14 + 6 * l}%, ${74 + 18 * l}%)`;
    },
    decor: {
      rimOuter: true,
      rimInner: false,
      dots: false,
      bevel: true,
      sheen: true,
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    depthRatio: 0.058,
    rimSlices: 64,
    rimColor: (a) => {
      const l = light(a);
      const hue = (a * 1.6 + 190) % 360;
      return `hsl(${hue}, ${70 + 20 * l}%, ${24 + 28 * l}%)`;
    },
    decor: {
      rimOuter: true,
      rimInner: false,
      dots: false,
      bevel: false,
      sheen: true,
    },
  },
];

export const defaultDesignId: CoinDesignId = 'ivory';

export function getDesign(id: CoinDesignId): CoinDesign {
  return coinDesigns.find((d) => d.id === id) ?? coinDesigns[0];
}
