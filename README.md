# Zanim Tutorial / Web Showcase

Independent tutorial repository for Zanim. The core Zanim repository contains runtime code and tests only; executable examples live here.

## Web showcase

This Vue + Vite site installs a packed `@zanim/web` from `vendor/` and rebuilds the Python examples with public Web APIs.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The site currently includes core 2D/timeline/layout examples, interactive linear algebra, external media, Fourier/fractal/complex examples, JAnim effect-parity scenes and real WASM 3D.

Web formulas use `zanim()` from `@zanim/web/vite`. `vite dev` / `vite build` automatically invoke local Typst and emit SVG assets; the production browser never downloads a Typst compiler. Provide Typst through `ZANIM_TYPST`, project `.tools/typst`, `PATH`, or the plugin option.

`public/assets/math-matrices.json` remains intentional: it records Python's seeded `random.Random` sequence so the browser example uses exactly the same matrix values rather than JavaScript's unrelated PRNG. Formula cache JSON files are no longer used.

## Python examples

The original Zanim Python tutorial/examples are under:

```text
examples/
├── showcase/
├── extras/
├── janim_api/
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

Node 18 is supported by this tutorial, so it currently uses Vite 5 rather than the newest create-vite toolchain.
