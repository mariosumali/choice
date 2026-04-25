# coin

A minimalist decision-making app for macOS and iOS. It presents itself as a fair coin flip and choice picker — but it is secretly, completely rigged by system volume.

## Stack

- Vite + React 18 + TypeScript web UI
- Capacitor 6 wraps the UI into a native iOS app; Mac Catalyst ships the same codebase on macOS
- Local Capacitor plugin `system-volume` reads `AVAudioSession.outputVolume` in Swift

## Coin designs

In **Coin** mode, six swatches under the mode toggle change the 3D coin (faces, edge slice lighting, and optional details like dots or sheen). The choice is saved in `localStorage` as `coin.design` (Brass, Obsidian, Jade, Bronze, Porcelain, Neon). The wheel mode does not show the swatches.

## Rigging rules

**Coin flip**

| Notches   | Result             |
| --------- | ------------------ |
| 0 / muted | Always HEADS       |
| 1         | Always TAILS       |
| 2+        | Truly random       |

**Choice picker wheel** (up to 8 items)

| Notches   | Result             |
| --------- | ------------------ |
| 0 / muted | Truly random       |
| 1..8      | Forces choice N    |
| 9+        | Truly random       |

Volume is converted to notches as `round(outputVolume * 16)` (iOS default step count).

## Run locally (browser)

```bash
npm install
(cd plugins/system-volume && npm install && npx tsc)
npm run dev
```

The browser build uses a stub that reports mid-level volume, so both modes run in "truly random" mode. Use a device to exercise the rigging.

## Run on iOS

Requires full Xcode (not just the Command Line Tools) and CocoaPods installed.

```bash
npm install
(cd plugins/system-volume && npm install && npx tsc)
npm run build
npx cap sync ios   # runs pod install and registers the SystemVolume plugin
npx cap open ios   # opens Xcode
```

In Xcode, select a simulator or device and hit Run.

## Run on macOS (Mac Catalyst)

1. Open the iOS workspace in Xcode (`npx cap open ios`).
2. Select the **App** target.
3. Under **Supported Destinations**, click **+** and add **Mac Catalyst**.
4. Build and run with the Mac destination selected.

`AVAudioSession.outputVolume` is fully available on Catalyst and returns the Mac's system output volume.

## Project layout

```
src/
  App.tsx                   mode switcher
  modes/
    CoinFlip.tsx            coin flip mode
    ChoicePicker.tsx        choice picker + wheel
  components/
    Coin.tsx                3D coin markup
    Wheel.tsx               SVG wheel
    ModeToggle.tsx          top bar toggle
  lib/
    volume.ts               cross-platform volume reader
    rigging.ts              rigging engine (pure functions)
  styles.css                design system

plugins/system-volume/      local Capacitor plugin
  src/                      TS bridge
  ios/Plugin/               Swift AVAudioSession reader
```

## Non-goals

Per the PRD: no accounts, no history, no share, no hints, no settings.
