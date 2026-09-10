"""Lesson 11: 3D objects and Camera3D share the same Scene-owned time model."""

from __future__ import annotations

from math import sin, sqrt

from zanim import (
    BLUE,
    BOTTOM,
    DOWN,
    GREEN,
    PI,
    RED,
    SO3,
    TAU,
    TOP,
    Box3D,
    Camera3D,
    Canvas,
    Easing,
    Scene,
    Surface3D,
    Text,
    Transform3D,
    Vec2,
    Vec3,
)


def terrain(x: float, z: float) -> float:
    r = sqrt(x * x + z * z)
    return 0.38 * sin(2.3 * r) * (1.0 / (1.0 + 0.18 * r * r))


class ThreeD(Scene):
    def __init__(self) -> None:
        super().__init__(
            canvas=Canvas(1280, 720, 90),
            fps=60,
            camera3d=Camera3D(
                position=Vec3(7.0, 4.6, 8.0),
                target=Vec3(0, 0.15, 0),
                fov_y_degrees=38,
                layer_z_index=0,
            ),
        )

    def setup(self) -> None:
        self.cube_base = Transform3D.translation(-2.35, 0.35, 0)
        self.cube = Box3D(Vec3(1.55, 1.55, 1.55), color=BLUE, transform=self.cube_base)

        self.surface_base = Transform3D.translation(
            2.25, -0.35, 0
        ) @ Transform3D.scaling(0.72)
        self.surface = Surface3D(
            terrain,
            x_range=(-2.4, 2.4),
            y_range=(-2.4, 2.4),
            resolution=(49, 49),
            color=GREEN,
            transform=self.surface_base,
        )

        self.axes = (
            Box3D(
                Vec3(2.3, 0.025, 0.025),
                color=RED,
                transform=Transform3D.translation(0.9, -1.55, 0),
            ),
            Box3D(
                Vec3(0.025, 2.3, 0.025),
                color=GREEN,
                transform=Transform3D.translation(-0.25, -0.4, 0),
            ),
            Box3D(
                Vec3(0.025, 0.025, 2.3),
                color=BLUE,
                transform=Transform3D.translation(-0.25, -1.55, 1.15),
            ),
        )

        self.title = Text(
            "2D and 3D share one Scene", font_size=31, opacity=0, z_index=10
        )
        self.left_label = Text("SO(3)", font_size=24, opacity=0, z_index=10)
        self.right_label = Text("Surface3D", font_size=24, opacity=0, z_index=10)
        self.title.place(anchor=TOP, at=self.frame.top + 0.35 * DOWN)
        self.left_label.place(anchor=BOTTOM, at=self.frame.bottom + Vec2(-3.2, 0.55))
        self.right_label.place(anchor=BOTTOM, at=self.frame.bottom + Vec2(3.0, 0.55))

    def construct(self) -> None:
        self.add(*self.axes)
        cube, surface, title, left_label, right_label = self.add(
            self.cube, self.surface, self.title, self.left_label, self.right_label
        )

        with self.parallel(duration=5):
            title.fade_in(duration=0.7)
            self.camera3d.configure(
                Camera3D(
                    position=Vec3(6.2, 4.15, 7.15),
                    target=Vec3(0.15, 0.05, 0),
                    fov_y_degrees=35,
                    layer_z_index=0,
                ),
                easing=Easing.LINEAR,
            )
            left_label.fade_in(duration=0.8, at=0.15)
            right_label.fade_in(duration=0.8, at=0.2)
            cube.transform_function(
                lambda a: (
                    self.cube_base
                    @ SO3.rotation_axis(Vec3(1, 1, 0.35), TAU * a).to_transform3d()
                ),
                easing=Easing.LINEAR,
            )
            surface.transform_function(
                lambda a: (
                    Transform3D.translation(2.25, -0.35, 0)
                    @ Transform3D.rotation_y(-0.65 * PI * a)
                    @ Transform3D.scaling(0.72)
                ),
                easing=Easing.LINEAR,
            )
        self.wait(0.35)
