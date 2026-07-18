# 🎪 RR Slot Machine 

> *"Kung wa ka'y swerte sa iya, diri ta!"*

---

## 👥 Team Members

| Name | Student ID |
|---|---|
| Ronald Ryan Intud | `[Student ID]` |


---

## 🎡 Project Title & Theme

**Title:** RR Slot Machine 
**Theme:** Dark Carnival / Halloween Horror

The game is set inside a sinister carnival with a horror aesthetic — featuring an evil clown, a pumpkin, and a balloon as the reel symbols. The UI uses deep purples, neon pinks, and gold tones to evoke a spooky big-top atmosphere. Messages are written with dark, dramatic flair to keep the player on edge.

---

## 🚀 How to Run the Project

This is a **pure HTML/CSS/JavaScript** project — no installation, no build step required.

### Option 1 — Open Directly (Quickest)
1. Navigate to the project folder `rr_slotmachine/`
2. Double-click `index.html`
3. It opens in your default browser — done!

### Option 2 — Live Server (Recommended for Development)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. The page auto-reloads on every file save

### Option 3 — Local HTTP Server (Python)
```bash
# Python 3
python -m http.server 5500
# Then open: http://localhost:5500
```

> ⚠️ **Note:** Background music and sound effects require a user interaction (click) before playing, due to browser autoplay policies.

---

## ✅ Features Implemented

### 🎰 Core Gameplay
- **3-reel slot machine** with randomized outcomes each spin
- **Bet system** — adjust bet in steps of 10 (min: 10, max: 100)
- **Credit system** — starts at 100 credits; bet is deducted before each spin
- **Win detection** — three tiers: Jackpot (3 match), Win (2 match), Near Miss (2 match), Lose (all different)
- **Jackpot chance** — 5% random chance for a forced jackpot regardless of reels
- **Game Over state** — triggers when credits and bet both reach 0
- **Reset Game** — restores starting credits and bet to initial values

### 🎨 Visual Effects
- **Animated spinning reels** — symbols shuffle rapidly during spin
- **Winner flash animation** — machine glows pink on a win
- **Loser shake animation** — machine shakes on a loss
- **Confetti burst** — 44 coloured pieces rain down on wins
- **Floating particles** — 10 glowing orbs (5 pink, 5 gold) drift in the background
- **Smoke/blur blobs** — ambient purple and teal glows behind the machine
- **Bulb rail animation** — carnival lights blink along the top and bottom of the machine
- **Animated score counters** — credit and win numbers count up/down smoothly

### 🔊 Audio System
- **Background music (BGM)** — loops continuously at low volume
- **Audio ducking** — BGM fades down when a sound effect is playing, then fades back up
- **Win sound** — plays on a standard win
- **Jackpot sound** — plays on a full-match or jackpot win
- **Lose sound** — plays when the player loses
- **Bet sound** — plays when changing the bet amount
- **Spin sound** — placeholder ready for audio file
- **Reset sound** — placeholder ready for audio file

### 📱 Accessibility & UX
- **Responsive layout** — adapts for mobile screens (≤540px)
- **ARIA labels** on all interactive elements and reels
- **Live region** on game message for screen reader announcements
- **`prefers-reduced-motion`** support — disables all animations for users who need it
- **Button disabled states** — spin/bet buttons lock correctly during spin and game over
- **Focus-visible outlines** — keyboard navigation supported
- **Custom image symbols** — reels display PNG images instead of plain emoji

---

## 📁 Project Structure

```
rr_slotmachine/
├── index.html          ← Page structure and layout
├── style.css           ← All styles, animations, and responsive rules
├── script.js           ← Game logic, audio engine, UI updates
├── README.md           ← This file
├── images/
│   ├── bg.jpg          ← Background image
│   ├── evilclown.png   ← Reel symbol 1
│   ├── pumpkin.png     ← Reel symbol 2
│   └── ballon.png      ← Reel symbol 3
└── sounds/
    ├── bgm.mp3         ← Background music
    ├── reap.mpeg       ← Win sound effect
    ├── first.mpeg      ← Jackpot sound effect
    ├── take.mpeg       ← Lose sound effect
    ├── corpse.mpeg     ← Bet change sound effect
    ├── spin            ← (Placeholder — add spin audio)
    └── reset           ← (Placeholder — add reset audio)
```
