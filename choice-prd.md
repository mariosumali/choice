# coin — Product Requirements Document

**Version**: 0.1  
**Status**: Draft  
**Last Updated**: April 2026

---

## Overview

**coin** is a minimalist decision-making app for macOS and iOS. It presents itself as a fair coin flip and choice picker — but it is secretly, completely rigged by system volume level. The experience is deadpan and premium: no winks, no hints. Users who discover the mechanic feel clever. Users who don't just think they're unlucky.

---

## Core Mechanic: Volume-Based Rigging

The entire app is controlled by the device's current volume level at the moment of a flip/spin. This applies identically on macOS (Web Audio API volume detection) and iOS.

### Coin Flip

| Volume State | Result |
|---|---|
| Muted / 0 notches | Always **HEADS** |
| 1 notch | Always **TAILS** |
| 2+ notches | Truly random |

### Choice Picker Wheel (up to 8 items)

| Volume State | Result |
|---|---|
| Muted / 0 notches | Truly random |
| 1 notch | Always picks **Choice 1** |
| 2 notches | Always picks **Choice 2** |
| 3 notches | Always picks **Choice 3** |
| … | … |
| 8 notches | Always picks **Choice 8** |
| 9+ notches | Truly random |

### Dice Roll (single D6)

| Volume State | Result |
|---|---|
| Muted / 0 notches | Always **6** |
| 1 notch | Always **1** |
| 2 notches | Always **2** |
| 3 notches | Always **3** |
| 4 notches | Always **4** |
| 5 notches | Always **5** |
| 6 notches | Always **6** |
| 7+ notches | Truly random |

### Yes / No / Maybe Oracle

| Volume State | Result |
|---|---|
| Muted / 0 notches | Always **YES** |
| 1 notch | Always **NO** |
| 2 notches | Always **MAYBE** |
| 3+ notches | Truly random (equal weight) |

### Rock Paper Scissors (app plays against user)

The user picks Rock, Paper, or Scissors. The app reveals its pick simultaneously. The app's pick is chosen *after* the user commits, based on volume, to force the outcome.

| Volume State | Outcome |
|---|---|
| Muted / 0 notches | App always **ties** the user |
| 1 notch | App always **beats** the user |
| 2 notches | User always **beats** the app |
| 3+ notches | App picks truly randomly |

### Number Range Picker (user-defined min / max)

| Volume State | Result |
|---|---|
| Muted / 0 notches | Always **max** |
| 1 notch | Always **min** |
| 2 notches | Always **midpoint** (floor of (min+max)/2) |
| 3+ notches | Truly random in [min, max] |

### Card Draw (standard 52-card deck + 2 jokers)

| Volume State | Result |
|---|---|
| Muted / 0 notches | Always **Ace of Spades** |
| 1 notch | Always **Joker** |
| 2+ notches | Truly random |

> **Design rationale**: Each mode uses a *different* mapping from volume notches to rigged outcomes — muted means HEADS for the coin, random for the wheel, 6 for dice, YES for the oracle, a tie for RPS, max for number range, and Ace of Spades for cards. This asymmetry is intentional: a user who notices one pattern (e.g., "muted always wins") cannot transfer the intuition to another mode, which keeps the overall mechanic harder to reverse-engineer. Each mode also retains a truly-random zone at higher volumes so power users who stumble into it see "fair" behavior and assume the whole app is fair.

---

## Platform Targets

| Platform | Method |
|---|---|
| macOS (Safari, Chrome) | Web app — `navigator.mediaDevices` or Web Audio `AudioContext` for volume detection |
| iOS (Safari) | PWA-installable web app — volume via `AVAudioSession` approximated through Web Audio |

Volume detection is read at the **moment of the flip/spin action**, not continuously polled.

> **Note**: Volume access on iOS requires a brief audio context interaction (a tap). The first tap that triggers the flip also unlocks audio context, so volume is read correctly.

---

## Modes

### Mode 1: Coin Flip
- A single large coin renders centered on screen
- Tap/click = coin flips with a satisfying 3D Y-axis rotation animation
- Lands on HEADS or TAILS per rigging rules
- Result typography is all-caps, centered, large
- Coin face shows H / T in stark serif type
- No other UI during flip — just the coin

### Mode 2: Choice Picker Wheel
- Users input up to 8 choices via a minimal text input list
- Empty slots are hidden
- Wheel is a circular spinner divided into equal segments, labeled
- Tap/click = wheel spins for ~2s then decelerates and stops at the rigged result
- Result is shown below the wheel with the winning label

### Mode 3: Dice
- A single 3D die renders centered, resting on a subtle shadow
- Tap/click = die tumbles for ~1.2s with a physics-ish bounce, lands on the rigged face
- Result face is simply the top of the die — no numeric readout overlay
- All six faces are pip-based in stark monochrome

### Mode 4: Oracle (Yes / No / Maybe)
- A blank circular surface, like a still pool of ink
- User taps and holds to "ask"; release to reveal
- The answer fades up through the surface in large serif caps
- No question input — the question lives in the user's head only

### Mode 5: Rock Paper Scissors
- Three large glyphs (✊ ✋ ✌︎ rendered as bespoke typography, not emoji) as the user's choice row
- User taps one — the app's choice immediately flips into view opposite
- A single word below — **WIN**, **LOSE**, or **TIE** — in all caps
- Reveal animation is a synchronized flip; there is no perceptible delay that would suggest the app chose second

### Mode 6: Number Range
- Two minimal numeric inputs: **min** and **max**
- A single large button beneath — tap to generate
- The result replaces the button area in oversized serif type
- No history, no "roll again" button (user just taps the result to reset)

### Mode 7: Card Draw
- A single card back centered, with a quiet specular highlight
- Tap = card flips on its horizontal axis to reveal the face
- Suits and ranks are in classic serif; no modern playing-card ornament
- Tap the face to return to the back

---

## Design System

### Aesthetic Direction
Extremely intentionally well designed with nice animations and depth to all models. 

---


---

## Non-Goals (v1)

- No accounts, no history log, no share feature
- No explanation of the rigging — ever
- No haptics beyond native iOS tap feedback

---