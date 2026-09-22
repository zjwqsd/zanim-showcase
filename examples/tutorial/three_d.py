from zanim import (
    BLUE,
    GREEN,
    TAU,
    Box3D,
    Camera3D,
    Canvas,
    Easing,
    Scene,
    Transform3D,
    Vec3,
)


class ThreeDStatic(Scene):
    def __init__(self):
        super().__init__(
            canvas=Canvas(1280, 720, 92),
            camera3d=Camera3D(
                position=Vec3(5.8, 4.4, 7.4),
                target=Vec3(),
                fov_y_degrees=36,
            ),
        )

    def construct(self):
        self.add(
            Box3D(Vec3(2, 2, 2), color=BLUE, position=(-1.4, 0, 0)),
            Box3D(Vec3(1.4, 2.8, 1.4), color=GREEN, position=(1.45, 0, 0)),
        )


class ThreeDMotion(Scene):
    def __init__(self):
        super().__init__(
            canvas=Canvas(1280, 720, 92),
            camera3d=Camera3D(
                position=Vec3(5.8, 4.4, 7.4),
                target=Vec3(),
                fov_y_degrees=36,
            ),
        )

    def construct(self):
        cube = self.add(Box3D(Vec3(2.2, 2.2, 2.2), color=BLUE))
        cube.transform_function(
            lambda a: (
                Transform3D.rotation_y(TAU * a) @ Transform3D.rotation_z(TAU * 0.4 * a)
            ),
            duration=5,
            easing=Easing.LINEAR,
        )
