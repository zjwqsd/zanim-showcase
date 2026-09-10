"""Lesson 03: one-time layout before add, animated layout from the Scene authored head."""

from __future__ import annotations

from zanim import (
    BLUE,
    BOTTOM,
    DOWN,
    GREEN,
    MUTED,
    ORANGE,
    PURPLE,
    TOP,
    WORLD,
    Canvas,
    Circle,
    Color,
    Column,
    Grid,
    Group,
    Rectangle,
    RegularPolygon,
    Row,
    Scene,
    Square,
    Text,
    Vec2,
)


class LayoutExample(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        # Declare: geometry/style first; no timeline state exists yet.
        self.title = Text("Declare → layout → animate", font_size=34)
        self.note = Text(
            "layout is an explicit target, not a persistent constraint",
            font_size=21,
            color=MUTED,
        )

        tile_stroke = Color(225, 235, 255)
        square = Square(1.0, fill=BLUE.with_alpha(185), stroke=tile_stroke)
        circle = Circle(0.55, fill=ORANGE.with_alpha(185), stroke=tile_stroke)
        triangle = RegularPolygon(
            3, 0.68, fill=GREEN.with_alpha(185), stroke=tile_stroke
        )
        card = Rectangle(1.35, 0.82, fill=PURPLE.with_alpha(185), stroke=tile_stroke)
        self.group = Group([square, circle, triangle, card])

        # Layout: one-time placement mutates only the raw pre-Scene definitions.
        self.header = self.frame.top_region(height=1.25)
        self.content = self.frame.inset(0.7).below(self.header, gap=0.25)
        self.title.place(anchor=TOP, at=self.header.top + 0.28 * DOWN)
        self.note.place(anchor=TOP, at=self.title.anchor(BOTTOM) + 0.14 * DOWN)
        Row(gap=0.75, at=self.content.center).place(*self.group.children)

    def construct(self) -> None:
        # add() is the ownership boundary; construct() only authors Scene time.
        title, note, group = self.add(self.title, self.note, self.group)
        square, circle, triangle, card = group.children
        self.wait(0.7)

        with self.parallel(duration=1.2):
            square.move(by=(-1.5, 1.0), frame=WORLD)
            circle.rotate(by=0.9, about=circle.center)
            triangle.scale(by=1.45, about=triangle.center)
            card.move(by=(1.3, -0.9), frame=WORLD)

        self.wait(0.35)
        self.layout(group, to=Row(gap=0.75, at=self.content.center), duration=1.0)

        self.wait(0.3)
        self.layout(
            group,
            to=Grid(rows=2, cols=2, gap=Vec2(0.9, 0.65), at=self.content.center),
            duration=1.1,
        )

        self.wait(0.3)
        self.layout(group, to=Column(gap=0.38, at=self.content.center), duration=1.1)

        self.wait(0.3)
        self.layout(group, to=Row(gap=0.75, at=self.content.center), duration=1.0)

        self.wait(0.4)
