# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A minimal 2D "Asteroids"-style game for learning/demo purposes. Pure HTML5 Canvas + vanilla JS — no build step, no dependencies, no bundler.

- `index.html` — sets up the `800x600` canvas and loads `game.js`.
- `game.js` — the entire game: ship, bullets, asteroids, input, collisions, and the main loop, in one file.

## Running

Open `index.html` directly in a browser, or serve it statically (e.g. `python3 -m http.server`) and visit the served URL. There is no build/lint/test tooling in this project.

## Architecture

Everything lives in `game.js` as plain objects and functions (no classes, no modules) operating on a single 2D canvas context (`ctx`), organized in sections:

- **Ship** (`ship` object): position/velocity/angle state; `updateShip()` reads `keys{}` for rotation (Left/Right or A/D), thrust (Up/W, with friction damping), and shooting (Space, rate-limited via `ship.shootCooldown`).
- **Bullets** (`bullets` array): spawned by `shoot()`, travel in a straight line, expire via a `life` countdown.
- **Asteroids** (`asteroids` array): each has a fixed set of `vertices` (angle+radius offsets) generated once at creation to draw an irregular polygon; movement/rotation (`spin`) is separate from the vertex shape. `spawnAsteroidAwayFromShip()` ensures new asteroids don't appear on top of the ship.
- **Collisions**: circle-based distance checks only (`Math.hypot`), not polygon-accurate — bullet-vs-asteroid destroys the asteroid and spawns a replacement; ship-vs-asteroid resets the ship to center.
- **Wrap-around** (`wrap()`): shared by ship, bullets, and asteroids — anything leaving one edge of the canvas reappears on the opposite edge.
- **Input**: a single `keys{}` map updated by `keydown`/`keyup` listeners, polled each frame for continuous movement.
- **Main loop** (`loop()`): `requestAnimationFrame`-driven; clears the canvas to black, updates all entities, checks collisions, then draws everything in white (`strokeStyle`/`fillStyle = '#fff'`).

When extending gameplay, follow the existing pattern: plain object + `updateX()`/`drawX()` function pair, wired into `loop()`.
