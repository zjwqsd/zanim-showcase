"""A self-contained neural-network pulse built from batch geometry."""

from __future__ import annotations

import random
from pathlib import Path

from zanim import Canvas, Color, Scene, Text, Vec2, affine2d
from zanim.batch import BatchObject2D, CircleSet, LineSet
from zanim.mapping import (
    activation_colors,
    activation_radii,
    signed_weight_colors,
    weight_widths,
)

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "media/extras/neural_network.mp4"
LAYERS = (6, 9, 7, 4)
XPOS = (-5.4, -1.8, 1.8, 5.2)


def layer_points(x: float, count: int) -> tuple[Vec2, ...]:
    step = 5.4 / max(1, count - 1)
    return tuple(Vec2(x, 2.7 - i * step) for i in range(count))


def transparent(colors: tuple[Color, ...]) -> tuple[Color, ...]:
    return tuple(c.with_alpha(0) for c in colors)


class NeuralNetwork(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 82)
        self.fps = 60

        rng = random.Random(20260821)
        self.points = tuple(layer_points(x, n) for x, n in zip(XPOS, LAYERS))
        self.edge_objects: list[BatchObject2D] = []
        self.edge_targets: list[LineSet] = []
        for left, right in zip(self.points, self.points[1:]):
            starts = tuple(a for a in left for _ in right)
            ends = tuple(b for _ in left for b in right)
            weights = tuple(rng.uniform(-1, 1) for _ in starts)
            colors = signed_weight_colors(weights, min_alpha=18, max_alpha=135)
            widths = weight_widths(weights, minimum=0.0025, maximum=0.008)
            self.edge_objects.append(
                BatchObject2D(
                    LineSet(starts, ends, transparent(colors), widths), z_index=0
                )
            )
            self.edge_targets.append(LineSet(starts, ends, colors, widths))

        self.node_objects: list[BatchObject2D] = []
        self.node_targets: list[CircleSet] = []
        for layer_index, centers in enumerate(self.points):
            values = tuple(rng.random() for _ in centers)
            base = Color(80 + 40 * layer_index, 150, 255 - 35 * layer_index)
            fills = activation_colors(values, base=base, min_alpha=50, max_alpha=255)
            radii = activation_radii(values, minimum=0.13, maximum=0.23)
            idle = CircleSet(
                centers,
                (0.14,) * len(centers),
                tuple(base.with_alpha(26) for _ in centers),
            )
            active = CircleSet(
                centers,
                radii,
                fills,
                tuple(Color(230, 238, 255, 170) for _ in centers),
                (0.018,) * len(centers),
            )
            self.node_objects.append(BatchObject2D(idle, z_index=2))
            self.node_targets.append(active)

        self.title = Text(
            "Signals flow; geometry stays batched",
            font_size=31,
            transform=affine2d(position=(0, 3.55)),
            opacity=0,
            z_index=10,
        )

    def construct(self) -> None:
        edge_count = len(self.edge_objects)
        node_count = len(self.node_objects)
        handles = [self.add(obj) for obj in (*self.edge_objects, *self.node_objects)]
        edge_objects = handles[:edge_count]
        node_objects = handles[edge_count : edge_count + node_count]
        title = self.add(self.title)
        title.fade_in(duration=0.6)

        for i in range(len(edge_objects)):
            with self.parallel():
                node_objects[i].batch(to=self.node_targets[i], duration=0.55)
                edge_objects[i].batch(to=self.edge_targets[i], duration=0.75, at=0.25)
                node_objects[i + 1].batch(
                    to=self.node_targets[i + 1], duration=0.55, at=0.65
                )
            self.wait(0.12)

        out = self.points[-1]
        winner = 2
        values = tuple(1.0 if i == winner else 0.22 for i in range(len(out)))
        final = CircleSet(
            out,
            activation_radii(values, minimum=0.15, maximum=0.31),
            activation_colors(
                values, base=Color(255, 158, 82), min_alpha=65, max_alpha=255
            ),
            tuple(Color(255, 240, 210, 240) for _ in out),
            (0.026,) * len(out),
        )
        node_objects[-1].batch(to=final, duration=0.55)
        self.wait(0.65)


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    scene = NeuralNetwork()
    scene._run_authoring_hooks()
    print(scene.render_video(OUTPUT, verify_random_access=True))


if __name__ == "__main__":
    main()
