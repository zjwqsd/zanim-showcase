# Zanim Vue Showcase

An independent downstream Vue + Vite project using the published shape of `@zanim/web`.

The project was created outside the Zanim repository, installs a packed `@zanim/web@0.0.1` tarball from `vendor/`, and does not import or reuse Zanim's existing Web Gallery/demo source. Scene implementations are reconstructed from the Python examples and public package API.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Node 18 is intentionally supported here, so this project uses Vite 5 instead of the current `create-vite@latest` toolchain.

## Ported scenes

17 scenes are implemented in `src/scenes/index.js`, covering core authoring, lifetime/state, layout, timeline composition, coordinate frames, dense batches, forward kinematics, infinite linear algebra, Math/Typst vectors, external media, SVG vectors, Hilbert curves, classic fractals, modular multiplication, De Casteljau, Mandelbrot/Julia and complex mappings.

The ports preserve the Python examples' authored timings, relative `at` offsets, `parallel()` structure, LOCAL/PARENT/WORLD frame semantics, procedural formulas and geometry motion where the public Web API can express them.

Math uses the public Web `Math` object with a static compiler callback. Typst-generated `VectorDocument` data is precompiled into `public/assets/math-cache.json`, keeping the site fully static. The deterministic matrix sequence in the Python math example is also precomputed with Python's `random.Random` into `math-matrices.json`, so browser output does not drift because of a different JavaScript PRNG.

## Deferred

3D, compositing/masks, red-black-tree traces, sorting traces and specialized neural-network/MNIST/MIDI examples are intentionally left out until they can be reproduced without changing their semantics.

- Fourier drawing: runtime SVG fetch → arc-length samples → browser DFT → `FourierEpicycles`.
