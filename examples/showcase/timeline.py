"""Lesson 04: compose Scene-owned timeline channels with offsets and interpolation."""

from __future__ import annotations

from zanim import (
    BLUE,
    DOWN,
    GREEN,
    PI,
    PINK,
    TOP,
    WORLD,
    Canvas,
    Circle,
    Row,
    Scene,
    Square,
    Text,
    Vec2,
)


class TimelineExample(Scene):
    def construct(self) -> None:
        self.canvas = Canvas(1280, 720, 95)
        self.fps = 60

        title = Text("One timeline, independent channels", font_size=32, opacity=0)
        left = Circle(0.72, fill=BLUE.with_alpha(80), stroke=BLUE, stroke_width=0.045)
        middle = Square(1.35, fill=PINK.with_alpha(80), stroke=PINK, stroke_width=0.045)
        source = Circle(
            0.75, fill=GREEN.with_alpha(80), stroke=GREEN, stroke_width=0.045
        )
        target = Square(1.45, fill=BLUE.with_alpha(80), stroke=BLUE, stroke_width=0.045)

        header = self.frame.top_region(height=1.2)
        title.place(anchor=TOP, at=header.top + 0.25 * DOWN)
        Row(gap=0.85, at=Vec2()).place(left, middle, source, target)
        title, left, middle, source, target = self.add(
            title, left, middle, source, target
        )
        title.fade_in(duration=0.7)

        with self.parallel():
            left.move(by=(0, 1.0), frame=WORLD, duration=2.2)
            middle.affine(
                position=middle.center, rotation=PI, scale=1.35, duration=1.1, at=0.35
            )
            middle.style(
                fill=GREEN.with_alpha(80),
                stroke=GREEN,
                stroke_width=0.045,
                duration=1.0,
                at=1.45,
            )
            self.interpolate(source, target, duration=2.2, at=0.5)

        self.wait(0.35)
        with self.parallel(duration=0.7):
            left.fade_out()
            middle.fade_out(at=0.1)
            title.fade_out(at=0.2)
            source.fade_out(at=0.2)
            target.fade_out(at=0.2)
