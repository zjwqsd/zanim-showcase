"""Lesson 05: LOCAL/PARENT/WORLD authored transforms and the Scene-owned Camera2D."""

from __future__ import annotations

from zanim import (
    BLUE,
    DEGREES,
    GREEN,
    LOCAL,
    MUTED,
    PARENT,
    RED,
    TOP,
    WHITE,
    WORLD,
    YELLOW,
    Canvas,
    Color,
    Dot,
    Group,
    Line,
    Scene,
    Square,
    Text,
    Vec2,
)


def axis(color: Color, end: Vec2):
    return Line(Vec2(), end, stroke=color, stroke_width=0.035)


def make_panel(center_x: float) -> Group:
    tool = Group(
        [
            Square(0.72, fill=BLUE.with_alpha(190), stroke=WHITE),
            axis(RED, Vec2(0.78, 0)),
            axis(GREEN, Vec2(0, 0.78)),
        ],
        position=(-0.55, -0.1),
        rotation=-33 * DEGREES,
    )
    return Group(
        [
            axis(RED, Vec2(1.5, 0)),
            axis(GREEN, Vec2(0, 1.15)),
            Dot(radius=0.07, color=WHITE),
            tool,
        ],
        position=(center_x, -0.45),
        rotation=20 * DEGREES,
    )


class Transforms(Scene):
    def construct(self) -> None:
        self.canvas = Canvas(1280, 720, 90)
        self.fps = 60

        title = Text("One vector, three coordinate frames", font_size=35)
        subtitle = Text(
            "move(by=(1.5, 0), frame=...) changes which basis interprets the vector",
            font_size=21,
            color=MUTED,
        )
        title.place(anchor=TOP, at=self.frame.top + Vec2(0, -0.28))
        subtitle.place(anchor=TOP, at=title.anchor(TOP) + Vec2(0, -0.55))

        panels = [make_panel(-4.1), make_panel(0.0), make_panel(4.1)]
        labels = [
            Text("LOCAL", font_size=24, color=YELLOW),
            Text("PARENT", font_size=24, color=YELLOW),
            Text("WORLD", font_size=24, color=YELLOW),
        ]
        for x, label in zip((-4.1, 0.0, 4.1), labels):
            label.place(anchor=TOP, at=Vec2(x, 2.05))

        self.add(title, subtitle, *labels)
        local_panel, parent_panel, world_panel = self.add(*panels)
        local_tool = local_panel.children[-1]
        parent_tool = parent_panel.children[-1]
        world_tool = world_panel.children[-1]
        self.wait(0.6)

        with self.parallel(duration=2.2):
            local_tool.move(by=(1.5, 0), frame=LOCAL)
            parent_tool.move(by=(1.5, 0), frame=PARENT)
            world_tool.move(by=(1.5, 0), frame=WORLD)

        self.wait(0.45)
        self.camera.affine(position=(0.65, -0.15), scale=1.12, duration=1.0)
        self.camera.affine(position=(0.0, 0.0), scale=1.0, duration=0.9)
        self.wait(0.35)
