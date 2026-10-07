# BOLLY KOMBAT — Dhishoom Edition

A Mortal Kombat-style 2D fighting game starring Bollywood superheroes. When they land hard hits, they deliver their famous filmy dialogues.
It's plain HTML5 Canvas + JavaScript with no build step and no dependencies.

## ▶ Play online

**https://bolly-kombat.vercel.app**

Click or press any key once to enable sound and dialogue voices.

## Run locally

```bash
python3 -m http.server 8765
```
Then open http://localhost:8765. Opening `index.html` directly also works. Click or press a key once to enable sound and the dialogue voices.

## Roster (11)

| Fighter | Star | Film | Special | Superstar move | Fatality ("PACKUP") |
|---|---|---|---|---|---|
| G.ONE | Shah Rukh Khan | Ra.One | Plasma Ball | H.A.R.T. Blaster (beam) | Naam Toh Suna Hoga (launched into orbit) |
| RA.ONE | Arjun Rampal | Ra.One | Cube Teleport (shatters, reappears behind you) | Dus Sar Ka Raavan (attack with clones) | Game Over (shattered into cubes) |
| KRRISH | Hrithik Roshan | Krrish | Jaadoo Dash | Krrish Rush | Kaho Naa... Dance Hai |
| FLYING JATT | Tiger Shroff | A Flying Jatt | Flying Kick | Antariksh Dhulai (carried into space) | Pollution-Free Zone |
| CHITTI | Rajinikanth | Robot / 2.0 | Magnet Bolts | Chitti Army (clones) | Ctrl + Alt + Delete |
| SHAKTIMAAN | Mukesh Khanna | Shaktimaan | Shakti Spin | Om Tornado | Sorry Shaktimaan |
| MR. INDIA | Anil Kapoor | Mr. India | Gayab! (invisibility, red light) | Invisible Dhulai | Gayab Kar Diya |
| SINGHAM | Ajay Devgn | Singham | Satakli Shockwave | Jeep Entry | Arrest Warrant |
| CHULBUL PANDEY | Salman Khan | Dabangg | Boomerang Chashma | Thappad Express | Dabangg Thappad |
| GABBAR SINGH | Amjad Khan | Sholay | Pistol | Chhe Goliyan | Yeh Haath Humko De De |
| MOGAMBO (boss) | Amrish Puri | Mr. India | Acid Toss | Acid Ray | Acid Ka Kund |

## Controls

| Action | P1 | P2 |
|---|---|---|
| Move / jump / crouch | A D / W / S | ← → / ↑ / ↓ |
| Punch / Kick / Special | F / G / H | J / K / L |
| Block (+down = low block) | R | I |
| Superstar move (full meter) | T | O |
| Pause | Esc / P | |

Combos: Punch → Punch → Kick. Down + Kick is a sweep. Jump + Kick is a flying kick.
After you win the final round, the announcer shouts **"KHATAM KARO ISKO!"**. Get close and press Super or Special to trigger the fatality.

## The dataset

`data/characters.js` is the single source of truth, and the game reads it directly. For each character it holds:
- **Bio**: actor, film, year, alter ego
- **`outfit`**: a plain-language costume description
- **`look`**: the rendering spec (skin, hair style, mask/glasses/hat, suit type, colours, circuits, bandolier, epaulettes…). The procedural renderer draws the character from this spec.
- **Stats, voice pitch/rate, special/super/fatality definitions**
- **`dialogues`** (92 in total): each has the Hinglish `text`, a Devanagari `hi` version (used by the Hindi text-to-speech voice), `source`, `year`, and `type`:
  - `film`: the line from the film
  - `meme`: a catchphrase
  - `parody`: a new joke written for this game
- **`on`**: which events trigger the line: `intro / hit / hurt / super / win / fatality`
- **`vs`** (optional): restricts a line to one opponent. G.One and Ra.One use this for rivalry intros, and in Arcade, G.One and Ra.One always face each other before the boss.

Export it to JSON and CSV:
```bash
node tools/export-dataset.mjs   # -> data/characters.json, data/dialogues.csv
```
To add a line, edit `characters.js` and add an entry to a character's `dialogues` array.

## Files
- `js/game.js`: engine, combat, AI, specials/supers/fatalities, scenes, HUD
- `js/render.js`: procedural character renderer (skeleton poses + outfits), portraits, stages, effects
- `js/audio.js`: synthesized SFX, the dhol/tabla music loop, dialogue text-to-speech
- `tools/roster.html`: dev sprite sheet (`?pose=idle,punch,kick&portraits`)

## Notes
- No photos, film stills or audio clips are bundled. Every character is a cartoon drawn in code from its costume spec.
- Voices use your browser's speech synthesis. A Hindi (hi-IN) voice is used when available; macOS has "Lekha".
