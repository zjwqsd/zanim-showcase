# Zanim examples

The examples have two jobs and are kept separate on purpose:

- [`showcase/`](showcase/) is the executable tutorial. Read it in order; every primary scene is a `Scene` subclass using only public Zanim authoring APIs. Most short scenes need only `construct()`; `setup()` is optional for heavier preparation.
- [`extras/`](extras/) contains complete, heavier animations that show what the framework can do after the tutorial concepts are familiar.

`janim/` is a regression/reference suite that reimplements visible effects from public JAnim examples with Zanim's own APIs. Thanks to the JAnim project for inspiration in animation API design, effects, and example organization. This directory is not an API-compatibility layer and does not define Zanim's API design.

## Requirements

The `examples/` directory is self-contained for bundled SVG/media assets. Text and Math examples require Typst, and the MNIST extra additionally requires NumPy and local MNIST raw data under `examples/assets/MNIST/raw/`. Install the Python example dependency with `zanim[examples]` when using a published package.

## Start here

```bash
zanim info
zanim preview examples/showcase/basics.py
```

Edit `basics.py`, save it, then press `↻` in Preview. Continue through [`showcase/README.md`](showcase/README.md) in order.

To render instead of previewing:

```bash
zanim render examples/showcase/basics.py -o basics.mp4
zanim render examples/showcase/basics.py --time 2.5 -o frame.png
```

## Extras

After the showcase, the same Preview command works for the larger demos:

```bash
zanim preview examples/extras/fourier_draw.py
zanim preview examples/extras/neural_network.py
zanim preview examples/extras/mnist_training.py
```

The scripts can still be run directly when you want their task-specific flags.

See [`extras/README.md`](extras/README.md) for what each one demonstrates.
