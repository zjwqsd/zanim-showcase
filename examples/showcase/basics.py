"""Lesson 01: class-based declare/layout → add/animate → render."""

from __future__ import annotations

from zanim import (
    BLUE,
    BOTTOM,
    DOWN,
    GREEN,
    ORANGE,
    TOP,
    UP,
    WORLD,
    Arrow,
    Canvas,
    Circle,
    Color,
    Dot,
    Group,
    Math,
    NumberLine,
    Row,
    Scene,
    Square,
    Text,
    Vec2,
)


class Basics(Scene):
    """The Manim-like class frontend is only organization over the same Scene model."""

    def setup(self) -> None:
        # setup(): declare raw visual state and perform one-time initial layout.
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        self.title = Text("Objects define; Scene owns time", font_size=34, opacity=0)
        self.subtitle = Math(
            r'"Scene" = "initial" + "authored head" + "timeline"',
            font_size=28,
            color=Color(170, 185, 215),
            opacity=0,
        )
        square = Square(
            1.25,
            fill=BLUE.with_alpha(185),
            stroke=Color(220, 232, 255),
            trim=0,
        )
        circle = Circle(
            0.68,
            fill=ORANGE.with_alpha(185),
            stroke=Color(220, 232, 255),
            trim=0,
        )
        dot = Dot(radius=0.11, color=Color(255, 227, 112), opacity=0, z_index=5)
        number_line = NumberLine((-4, 4), length=8.0, tick_step=1.0, z_index=-2)
        arrow = Arrow(Vec2(-3.2, 0), Vec2(3.2, 0), color=GREEN, z_index=1)
        shapes = Group([square, circle, dot])
        self.stage = Group([number_line, shapes, arrow])

        header = self.frame.top_region(height=1.35)
        content = self.frame.inset(0.6).below(header, gap=0.2)
        self.title.place(anchor=TOP, at=header.top + 0.25 * DOWN)
        self.subtitle.place(anchor=TOP, at=self.title.anchor(BOTTOM) + 0.14 * DOWN)
        Row(gap=0.7, at=content.center + 0.85 * UP).place(*shapes.children)
        number_line.place(anchor=BOTTOM, at=content.bottom + 1.2 * UP)
        arrow.place(anchor=BOTTOM, at=content.bottom + 2.05 * UP)

    def construct(self) -> None:
        # construct(): cross Scene.add() and author the same explicit timeline API.
        stage, title, subtitle = self.add(self.stage, self.title, self.subtitle)
        _, shapes, arrow = stage.children
        square, circle, dot = shapes.children

        with self.parallel():
            title.fade_in(duration=0.8)
            subtitle.fade_in(duration=0.9, at=0.15)
            square.create(duration=1.2)
            circle.create(duration=1.2, at=0.15)
            dot.fade_in(duration=0.6, at=0.7)

        with self.parallel(duration=1.6):
            shapes.move(by=(0.8, 0.25), frame=WORLD)
            square.paint(
                fill=GREEN.with_alpha(205),
                stroke=Color(220, 255, 240),
                stroke_width=0.06,
            )
            arrow.move(by=(0.15, 0.1), frame=WORLD)

        shapes.rotate(by=0.18, about=shapes.center, duration=0.8)
        shapes.scale(by=1.08, about=shapes.center, duration=0.6)

        self.camera.affine(position=(-0.3, -0.08), scale=1.15, duration=1.3)
        stage.fade_out(duration=0.9)
        self.wait(0.3)
