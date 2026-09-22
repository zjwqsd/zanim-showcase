"""Lesson 06: immutable vector resources with Scene-owned reveal/transform state."""

from __future__ import annotations

from pathlib import Path

from zanim import DOWN, MUTED, TOP, Canvas, Group, Scene, Text, VectorObject2D, load_svg

EXAMPLES = Path(__file__).resolve().parents[1]
SVG = EXAMPLES / "assets/fourier_heart.svg"


class Vectors(Scene):
    def construct(self) -> None:
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        title = Text("SVG becomes ordinary Zanim vector data", font_size=35)
        subtitle = Text(
            "load_svg() → VectorDocument → reusable VectorObject2D",
            font_size=22,
            color=MUTED,
        )
        title.place(anchor=TOP, at=self.frame.top + 0.28 * DOWN)
        subtitle.place(anchor=TOP, at=title.anchor(TOP) + 0.55 * DOWN)

        heart = load_svg(SVG)
        left = VectorObject2D(
            heart,
            reveal=0,
            position=(-2.6, -0.45),
            scale=0.72,
        )
        right = VectorObject2D(
            heart,
            reveal=0,
            opacity=0.72,
            position=(2.6, -0.45),
            rotation=-0.22,
            scale=0.72,
        )
        self.add(title, subtitle)
        hearts = self.add(Group([left, right]))
        left, right = hearts.children
        self.wait(0.45)

        with self.parallel():
            left.create(duration=1.8)
            right.create(duration=1.8, at=0.35)

        with self.parallel(duration=1.25):
            left.affine(position=(-2.25, -0.2), rotation=0.18, scale=0.82)
            right.affine(position=(2.25, -0.2), rotation=-0.38, scale=0.82)
            right.opacity(to=1.0)
        self.wait(0.65)
