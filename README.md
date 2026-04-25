# coin

A minimalist decision-making app for iOS and macOS (via Mac Catalyst). It looks like a simple coin, wheel, dice, and yes/no oracle — and it stays deadpan and premium. Under the hood, outcomes can follow your system volume (only on device; the browser build uses a neutral stub so everything feels “fairly random” while you develop).

---

## What it looks like

<p align="center">
  <img src="docs/screenshots/coin.png" alt="Coin mode: 3D coin with H on the face, design swatches, Flip the coin" width="45%" />
  &nbsp;
  <img src="docs/screenshots/wheel.png" alt="Wheel mode: two-way wheel for Pizza and Tacos" width="45%" />
  <br />
  <sub>Coin &mdash; pick a finish, flip a weighted 3D coin. Wheel &mdash; up to eight labels, one spin.</sub>
</p>

<p align="center">
  <img src="docs/screenshots/dice.png" alt="Dice mode: 3D die showing one pip, result ONE" width="45%" />
  &nbsp;
  <img src="docs/screenshots/oracle.png" alt="Oracle mode: dark sphere, Ask the oracle control" width="45%" />
  <br />
  <sub>Dice &mdash; one D6 with a big readable result. Oracle &mdash; hold to ask, release for Yes / No / Maybe.</sub>
</p>

*Screenshots from the Vite dev server; layout and theming are the same in the native shell.*

---

## Features

| Mode | You get |
| --- | --- |
| Coin | Six designs (brass, obsidian, jade, …) — stored in `localStorage` as `coin.design` |
| Wheel | Up to eight choices, SVG wheel + spin |
| Dice | D6 with roll animation and spelled-out result |
| Oracle | Yes / No / Maybe with a press-and-hold ritual — no winks, no tutorial |

Non-goals (per the PRD): no accounts, history, share sheet, hints UI, or settings screen.

---

## The volume twist (on device)

On iOS and Catalyst, a small Capacitor plugin reads `AVAudioSession.outputVolume` and turns it into notches (`round(outputVolume * 16)` on the default 16-step UI). The web build does not read real volume — the plugin falls back to a mid “random” level so you can develop in Chrome without surprises.

Rigging is implemented as pure functions in `src/lib/rigging.ts`. Rough cheat sheet:

- Coin: 0 notches (or muted) → always heads; 1 → always tails; 2+ → random.
- Wheel: 0 / muted → random; 1…8 → force that segment; 9+ → random.
- Dice and Oracle have their own notch→outcome tables (see `choice-prd.md` for the full matrix).

---

## Stack

- Vite, React 18, TypeScript for the UI
- Capacitor 6 wraps the web app for iOS; Mac Catalyst can run the same target on macOS
- Local plugin `plugins/system-volume` (Swift) bridges `outputVolume` to JavaScript

---

## Run locally (browser)

```bash
npm install
(cd plugins/system-volume && npm install && npx tsc)
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173/`). Volume rigging will not match a phone — use a device to feel the real behavior.

---

## Run on iOS

You need full **Xcode** (not only Command Line Tools) and **CocoaPods**.

```bash
npm install
(cd plugins/system-volume && npm install && npx tsc)
npm run build
npx cap sync ios
npx cap open ios
```

In Xcode, pick a simulator or device and run. `cap sync` runs `pod install` and registers the System Volume plugin.

---

## Run on macOS (Mac Catalyst)

1. Open the iOS workspace (`npx cap open ios`), select the **App** target.  
2. Under **Supported Destinations**, add **Mac Catalyst** if it’s not there.  
3. Build and run with the **My Mac** destination.  

`AVAudioSession.outputVolume` is available on Catalyst, so volume-driven outcomes work like on iPhone.

---

## Project layout

```
src/
  App.tsx                 # Mode switcher, design persistence
  main.tsx, styles.css
  modes/                  # Coin, Wheel, Dice, Oracle screens
  components/              # Coin, Wheel, dice, ModeToggle, DesignPicker, Oracle, …
  lib/
    volume.ts             # Capacitor plugin + web fallback
    rigging.ts            # Pure “what should happen for this reading?”
    coinDesigns.ts
plugins/system-volume/    # Local Capacitor plugin (TypeScript + Swift)
ios/                      # Xcode project, pods, native shell
```

More product detail: **`choice-prd.md`**.

---

## License

Private / unpublished — add a license if you open-source this repo.
