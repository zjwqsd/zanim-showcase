# Zanim Showcase & Docs

Standalone Chinese documentation, live Example Gallery, and example repository for Zanim. The core Zanim repository contains runtime code and tests; executable teaching examples live here.

## Documentation site

The Vue + Vite site is modeled after the Manim Community documentation layout: hierarchical docs navigation, concise Chinese tutorials, and a live Example Gallery. Gallery output is rendered by `@zanim/web`; videos are not used as substitutes for Zanim scenes.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The Gallery covers every suitable Python example in this repository, excluding only the intentionally long-running real MNIST training and MIDI piano programs. It includes core 2D/timeline/layout, algorithms, simulation, compositing, Fourier/fractals/complex math, JAnim-inspired reference scenes, and real WASM 3D.

Web formulas use `zanim()` from `@zanim/web/vite`. `vite dev` / `vite build` automatically invoke local Typst and emit SVG assets; the production browser never downloads a Typst compiler. Provide Typst through `ZANIM_TYPST`, project `.tools/typst`, `PATH`, or the plugin option.

`public/assets/math-matrices.json` remains intentional: it records Python's seeded `random.Random` sequence so the browser example uses exactly the same matrix values rather than JavaScript's unrelated PRNG. Formula cache JSON files are no longer used.

## Python examples

The original Zanim Python tutorial/examples are under:

```text
examples/
├── showcase/
├── extras/
├── janim/
└── assets/
```

They are plain user projects, not part of the Zanim package itself. Typical usage after installing Zanim:

```bash
zanim preview examples/showcase/basics.py
zanim render examples/showcase/three_d.py -o three_d.mp4
python examples/extras/fourier_draw.py
```

This separation is intentional: examples can grow as teaching material without adding maintenance/runtime coupling to the core repository.

## Toolchain

GitHub Pages deployment is defined in `.github/workflows/pages.yml`. The site is published at `https://zjwqsd.github.io/zanim-showcase/`.
