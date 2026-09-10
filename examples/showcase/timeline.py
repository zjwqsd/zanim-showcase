"""Lesson 04: compose Scene-owned timeline channels with offsets and interpolation."""

from __future__ import annotations

from math import sin

from zanim import (
    BLUE,
    DOWN,
    GREEN,
    PI,
    PINK,
    TAU,
    TOP,
    Canvas,
    Circle,
    Color,
    Easing,
    Row,
    Scene,
    Square,
    Style,
    Text,
    Vec2,
    affine2d,
)


def outlined(color: Color) -> Style:
    return Style.paint(color.with_alpha(80), color, 0.045)


class TimelineExample(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 95)
        self.fps = 60

        self.title = Text("One timeline, independent channels", font_size=32, opacity=0)
        self.left = Circle(0.72, style=outlined(BLUE))
        self.middle = Square(1.35, style=outlined(PINK))
        self.source = Circle(0.75, style=outlined(GREEN))
        self.target = Square(1.45, style=outlined(BLUE))

        header = self.frame.top_region(height=1.2)
        self.title.place(anchor=TOP, at=header.top + 0.25 * DOWN)
        Row(gap=0.85, at=Vec2()).place(self.left, self.middle, self.source, self.target)
        self.left_origin = self.left.center

    def construct(self) -> None:
        title, left, middle, source, target = self.add(
            self.title, self.left, self.middle, self.source, self.target
        )
        title.fade_in(duration=0.7)

        with self.parallel():
            left.transform_function(
                lambda a: affine2d(
                    position=(
                        self.left_origin.x,
                        self.left_origin.y + 0.55 * sin(4 * PI * a),
                    ),
                    rotation=TAU * a,
                ),
                duration=3.0,
                easing=Easing.LINEAR,
            )
            middle.affine(
                position=middle.center, rotation=PI, scale=1.35, duration=1.1, at=0.35
            )
            middle.style(to=outlined(GREEN), duration=1.0, at=1.45)
            self.interpolate(source, target, duration=2.2, at=0.5)

        self.wait(0.35)
        with self.parallel(duration=0.7):
            left.fade_out()
            middle.fade_out(at=0.1)
            title.fade_out(at=0.2)
            source.fade_out(at=0.2)
            target.fade_out(at=0.2)
