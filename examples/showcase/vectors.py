"""Lesson 06: immutable vector resources with Scene-owned reveal/transform state."""

from __future__ import annotations

from pathlib import Path

from zanim import DOWN, MUTED, TOP, Canvas, Group, Scene, Text, affine2d, load_svg
from zanim.vector import VectorObject2D

EXAMPLES = Path(__file__).resolve().parents[1]
SVG = EXAMPLES / "assets/fourier_heart.svg"


class Vectors(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        self.title = Text("SVG becomes ordinary Zanim vector data", font_size=35)
        self.subtitle = Text(
            "load_svg() → VectorDocument → reusable VectorObject2D",
            font_size=22,
            color=MUTED,
        )
        self.title.place(anchor=TOP, at=self.frame.top + 0.28 * DOWN)
        self.subtitle.place(anchor=TOP, at=self.title.anchor(TOP) + 0.55 * DOWN)

        heart_document = load_svg(SVG)
        self.left = VectorObject2D(
            heart_document,
            reveal=0,
            transform=affine2d(position=(-2.6, -0.45), scale=0.72),
        )
        self.right = VectorObject2D(
            heart_document,
            reveal=0,
            opacity=0.72,
            transform=affine2d(position=(2.6, -0.45), rotation=-0.22, scale=0.72),
        )
        self.hearts = Group([self.left, self.right])

    def construct(self) -> None:
        self.add(self.title, self.subtitle, self.hearts)
        left, right = map(self.on, (self.left, self.right))
        self.wait(0.45)

        with self.parallel():
            left.create(duration=1.8)
            right.create(duration=1.8, at=0.35)

        with self.parallel(duration=1.25):
            left.affine(position=(-2.25, -0.2), rotation=0.18, scale=0.82)
            right.affine(position=(2.25, -0.2), rotation=-0.38, scale=0.82)
            right.opacity(to=1.0)

        self.wait(0.65)
