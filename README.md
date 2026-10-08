# 🚀 CYBER-RAID 2088

> **Retro arcade space shooter powered 100% by mathematical DSP audio.**  
> Built with HTML5 Canvas & [`micro-sfx`](https://github.com/lwn2210/micro-sfx).

[![Live Game](https://img.shields.io/badge/Play%20Live-Cyber--Raid%202088-38bdf8?style=for-the-badge&logo=googlechrome&logoColor=white)](https://lwn2210.github.io/cyber-raid-2088/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🕹️ Live Demo

Play instantly in your browser (Desktop & Mobile Touch supported):  
👉 **[https://lwn2210.github.io/cyber-raid-2088/](https://lwn2210.github.io/cyber-raid-2088/)**

---

## ✨ Features

- **0 KB External Audio Files:** 100% sound effects (twin lasers, cruiser plasma blasts, shields, combo gems, lowpass filtered explosions) are generated procedurally on-the-fly using WebAudio synthesis.
- **360° Omnidirectional Flight:** Free 2D maneuvering with aerodynamic banking tilt, velocity damping, and wingtip energy trails.
- **Dynamic Enemy Fleet:**
  - 🛸 **Agile Interceptors:** Sine-wave zig-zag evasive hunters.
  - ⚡ **Swoop Drones:** High-speed homing dive bombers.
  - 🛰️ **Stealth Scouts:** Flanking perimeter raiders.
  - 🛡️ **Heavy Command Cruisers:** High-durability gunships firing targeted counter-plasma lasers.
- **Cross-Platform Controls:**
  - **Desktop:** `W`, `A`, `S`, `D` or Arrow keys + `SPACE` to fire.
  - **Mobile:** Direct touch screen drag tracking + Virtual 4-Way D-Pad & Fire button.
- **Dynamic Pitch-Scaling Sound:** Laser and explosion pitch scale smoothly with your combo streak.
- **🆕 Week 4 — Procedural Chiptune BGM Engine (Zero MP3):**
  - 🎵 **4-Channel WebAudio Synth:** Square lead + triangle chord pads + driving triangle bass + noise-drum kit (kick/snare/hat), semua disintesis realtime — 0 KB file audio.
  - 🎼 **3 Sector Themes:** `asteroid` (A-minor 132 BPM space rock), `neon` (D-minor 120 BPM synthwave), `fleet` (E-minor 150 BPM boss assault).
  - ⏱️ **Lookahead Scheduler:** Pattern 16-step dijadwalkan 150 ms di depan via timer 30 ms — timing solid tanpa jitter.
  - 🔀 **Seamless Transitions:** Tema ikut sektor (start → asteroid, Neon City → neon, boss encounter → fleet), berhenti bersih saat game over.
- **🆕 Arcade Excellence Pass (Game Feel Overhaul):**
  - 💥 **Hit-Stop Freeze:** 3–5 frame true freeze on heavy kills, EMP blasts, boss phase breaks & final destruction — every impact *feels* heavier.
  - 🌊 **Shockwave Rings:** Expanding blast rings on EMP (220px), cruiser kills, core exposure and the Mothership death blast.
  - 🐌 **Boss Slow-Mo Death:** The dying cascade opens in slow motion before the chain explosions take over.
  - 🔊 **New Sound Synthesis:** Three-tone `alarm` klaxon on boss warning & core exposure, charged `phaser` on Plasma Spread, lowpass-noise `thruster` engine rumble every second of flight.
  - ✨ **Combo Popup:** Kill scores now show their multiplier (`+300 x2`).

---

## 🛠️ Tech Stack

- **Game Engine:** Pure HTML5 Canvas 2D (Zero external game libraries).
- **Sound Engine:** [`micro-sfx`](https://github.com/lwn2210/micro-sfx) Procedural DSP Engine.
- **Deployment:** GitHub Pages (Single HTML zero-build pipeline).

---

## 📄 License

MIT License © 2026 [lwn2210](https://github.com/lwn2210)
