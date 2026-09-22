"""Lesson 10: compose independently authored Scenes as random-access raster sources."""

from __future__ import annotations

from math import sin

from zanim import (
    BLUE,
    GREEN,
    MUTED,
    ORANGE,
    PI,
    TAU,
    TOP,
    WHITE,
    Canvas,
    Circle,
    Group,
    Rectangle,
    Scene,
    Square,
    Text,
    Vec2,
    affine2d,
)
from zanim.raster import AlphaMaskSource, RasterObject2D, SceneRasterSource

DURATION = 4.0


def content_scene() -> Scene:
    scene = Scene(canvas=Canvas(480, 320, 70), fps=60)
    square = Square(
        1.35,
        fill=BLUE.with_alpha(225),
        stroke=WHITE,
        position=(-1.25, 0.45),
        rotation=-0.2,
    )
    circle = Circle(
        0.82, fill=ORANGE.with_alpha(225), stroke=WHITE, position=(1.15, -0.35)
    )
    bar = Rectangle(
        3.8, 0.35, fill=GREEN.with_alpha(210), position=(0, -1.35), rotation=0.12
    )
    group = scene.add(Group([square, circle, bar]))
    group.transform_function(
        lambda a: affine2d(rotation=0.8 * PI * a, scale=1.0 + 0.08 * a),
        duration=DURATION,
    )
    return scene


def mask_scene() -> Scene:
    scene = Scene(canvas=Canvas(480, 320, 70), fps=60)
    aperture = Circle(1.25, fill=WHITE, position=(-1.75, 0), scale=0.8)
    aperture = scene.add(aperture)
    aperture.transform_function(
        lambda a: affine2d(
            position=(-1.75 + 3.5 * a, 0.35 * sin(TAU * a)),
            scale=0.8 + 0.55 * sin(PI * a),
        ),
        duration=DURATION,
    )
    return scene


class Compositing(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        self.title = Text(
            "A Scene can become raster data for another Scene", font_size=34
        )
        self.subtitle = Text(
            "content Scene + alpha-mask Scene → AlphaMaskSource → RasterObject2D",
            font_size=20,
            color=MUTED,
        )
        self.title.place(anchor=TOP, at=self.frame.top + Vec2(0, -0.28))
        self.subtitle.place(anchor=TOP, at=self.title.anchor(TOP) + Vec2(0, -0.55))

        content = content_scene()
        mask = mask_scene()
        self.content_view = RasterObject2D(
            SceneRasterSource(content),
            width=3.7,
            position=(-4.25, -0.55),
        )
        self.mask_view = RasterObject2D(
            SceneRasterSource(mask),
            width=3.7,
            position=(0.0, -0.55),
        )
        self.result = RasterObject2D(
            AlphaMaskSource(
                SceneRasterSource(content_scene()),
                SceneRasterSource(mask_scene()),
                feather=lambda t: 1.5 + 2.0 * (0.5 + 0.5 * sin(PI * t / DURATION)),
            ),
            width=3.7,
            position=(4.25, -0.55),
        )

        self.labels = [
            Text("content", font_size=21, color=MUTED),
            Text("mask alpha", font_size=21, color=MUTED),
            Text("result", font_size=21, color=MUTED),
        ]
        for x, label in zip((-4.25, 0.0, 4.25), self.labels):
            label.place(anchor=TOP, at=Vec2(x, 1.9))

    def construct(self) -> None:
        self.add(self.title, self.subtitle, *self.labels)
        content_view, mask_view, result = self.add(
            self.content_view, self.mask_view, self.result
        )
        with self.parallel(duration=DURATION):
            content_view.media()
            mask_view.media()
            result.media()
        self.wait(0.35)
