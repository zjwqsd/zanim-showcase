"""Lesson 12: nested Scene-owned transform heads form ordinary forward kinematics."""

from __future__ import annotations

from math import cos, sin

from zanim import (
    BLUE,
    BOTTOM,
    CENTER,
    GREEN,
    MUTED,
    ORANGE,
    ORIGIN,
    RIGHT,
    SE2,
    TAU,
    TOP,
    WHITE,
    Canvas,
    Color,
    Dot,
    Group,
    Line,
    Scene,
    Text,
    Vec2,
)
from zanim.geometry import Object2D


def link(length: float, color: Color) -> Object2D:
    return Line(ORIGIN, Vec2(length, 0), stroke=color, stroke_width=0.07)


class Kinematics(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 92)
        self.fps = 60

        l1, l2, l3 = 2.2, 1.7, 1.15
        link1 = link(l1, BLUE)
        link2 = link(l2, GREEN)
        link3 = link(l3, ORANGE)

        j1_mark = Dot(ORIGIN, radius=0.11, color=WHITE, z_index=4)
        j2_mark = Dot(ORIGIN, radius=0.11, color=WHITE, z_index=4)
        slider_mark = Dot(ORIGIN, radius=0.11, color=ORANGE, z_index=4)
        ee_mark = Dot(Vec2(l3, 0), radius=0.13, color=Color(255, 224, 105), z_index=5)

        joint3 = Group([slider_mark, link3, ee_mark], position=(l2, 0))
        joint2 = Group([j2_mark, link2, joint3], position=(l1, 0))
        self.joint1 = Group([j1_mark, link1, joint2])

        self.title = Text("Open-chain FK = ordinary frame composition", font_size=32)
        self.formula = Text(
            "T₀ₑ = T₀₁(q₁) · T₁₂(q₂) · T₂₃(q₃)",
            font_size=25,
            color=MUTED,
        )
        self.title.place(anchor=TOP, at=self.frame.top + Vec2(0, -0.35))
        self.formula.place(anchor=TOP, at=self.title.anchor(BOTTOM) + Vec2(0, -0.16))
        self.joint1.place(anchor=CENTER, at=Vec2(-0.6, -0.55))

    def construct(self) -> None:
        title, formula, joint1 = self.add(self.title, self.formula, self.joint1)
        _, _, joint2 = joint1.children
        _, _, joint3 = joint2.children
        self.wait(0.6)

        home1 = SE2.from_affine(joint1.transform_value)
        home2 = SE2.from_affine(joint2.transform_value)
        home3 = SE2.from_affine(joint3.transform_value)

        with self.parallel(duration=6):
            joint1.transform_function(lambda a: home1 @ SE2(theta=0.75 * sin(TAU * a)))
            joint2.transform_function(
                lambda a: home2 @ SE2(theta=-0.9 * sin(TAU * a + 0.8))
            )
            joint3.transform_function(
                lambda a: (
                    home3 @ SE2(translation=0.65 * (0.5 - 0.5 * cos(TAU * a)) * RIGHT)
                )
            )

        self.wait(0.5)
