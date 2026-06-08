# Nimbus Cockpit

A mobile-first family car-ride cockpit for Florian and the boys.

This version intentionally abandons the rejected `phone-test/` soundboard UI.
It is a new side-project surface, not FP branding.

## Runtime

- Static HTML, CSS, and JavaScript.
- GSAP is vendored locally in `js/gsap.min.js`.
- Real audio files are bundled under `assets/audio/` and `assets/voice/`.
- Web Audio handles crossfades, toggles, effects, and the signal pad.

## Core Experience

- Four mode decks: Cruise, Combat, Stealth, Warp.
- Real cinematic music beds for each mode.
- Real cockpit SFX for one-shot and on/off controls.
- Signal triangulation pad controls filter, delay, feedback, and distortion.
- Random mission events with a consistent robot voice.

## Asset Sources

- Kenney Sci-fi Sounds 1.0, CC0: https://kenney.nl/assets/sci-fi-sounds
- Space Music: Out There, CC0: https://opengameart.org/content/space-music-out-there
- Determined Pursuit, CC0: https://opengameart.org/content/determined-pursuit-epic-orchestra-loop
- Stealth Music, CC0: https://opengameart.org/content/stealth-music
- Insistent, CC0: https://opengameart.org/content/insistent-background-loop
- Deep Space Array, CC0: https://opengameart.org/content/deep-space-array

Robot voice files are locally generated with macOS `say -v Zarvox` and filtered
into `.m4a` assets.
