"""Lesson 08: dense immutable batch values with Scene-owned batch transitions."""

from __future__ import annotations

from math import cos, sin

from zanim import (
    DOWN,
    PI,
    TAU,
    TOP,
    BatchObject2D,
    Canvas,
    CircleSet,
    Color,
    LineSet,
    Scene,
    Text,
    Vec2,
)

N = 420


def circle_state(phase: float) -> CircleSet:
    centers, radii, fills = [], [], []
    for i in range(N):
        u = i / N
        angle = TAU * (u * 5.0 + phase)
        radius = 0.8 + 3.0 * u
        centers.append(Vec2(radius * cos(angle), radius * sin(angle)))
        radii.append(0.025 + 0.055 * (0.5 + 0.5 * sin(5 * TAU * u + phase * 2 * TAU)))
        fills.append(Color(round(70 + 170 * u), round(145 + 70 * (1 - u)), 255, 220))
    return CircleSet(tuple(centers), tuple(radii), tuple(fills))


def line_state(phase: float) -> LineSet:
    starts, ends, colors, widths = [], [], [], []
    for i in range(180):
        u = i / 180
        a = TAU * u
        b = a + phase * PI
        starts.append(Vec2(2.0 * cos(a), 2.0 * sin(a)))
        ends.append(Vec2(3.5 * cos(b), 3.5 * sin(b)))
        colors.append(Color(100, round(140 + 100 * u), 255, 100))
        widths.append(0.006)
    return LineSet(tuple(starts), tuple(ends), tuple(colors), tuple(widths))


class Batches(Scene):
    def construct(self) -> None:
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        title = Text("600 primitives, two batch objects", font_size=31, opacity=0)
        title.place(anchor=TOP, at=self.frame.top + 0.35 * DOWN)
        lines, dots, title = self.add(
            BatchObject2D(line_state(0.0), z_index=0),
            BatchObject2D(circle_state(0.0), z_index=2),
            title,
        )
        title.fade_in(duration=0.6)

        with self.parallel(duration=2):
            dots.batch(to=circle_state(0.33))
            lines.batch(to=line_state(0.55))
        with self.parallel(duration=2):
            dots.batch(to=circle_state(0.68))
            lines.batch(to=line_state(1.0))
        self.wait(0.4)
