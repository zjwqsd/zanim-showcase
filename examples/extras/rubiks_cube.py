"""A fully articulated 3D Rubik's Cube built from Group3D cubies."""

from __future__ import annotations

from dataclasses import dataclass
from math import pi

from zanim import (
    PARENT,
    SE3,
    SO3,
    WHITE,
    Box3D,
    Camera3D,
    Canvas,
    Color,
    Group3D,
    Scene,
    Text,
    Transform3D,
    Vec3,
)

CANVAS = Canvas(1280, 720, 108)
CUBIE_SIDE = 0.92
SPACING = 1.0
STICKER_SIDE = 0.72
STICKER_THICKNESS = 0.035
STICKER_OFFSET = CUBIE_SIDE * 0.5 + STICKER_THICKNESS * 0.56
TURN_DURATION = 0.52
TURN_PAUSE = 0.07

BODY = Color(17, 20, 24)
WHITE_FACE = Color(242, 242, 236)
YELLOW_FACE = Color(252, 211, 45)
RED_FACE = Color(224, 54, 62)
ORANGE_FACE = Color(255, 128, 37)
GREEN_FACE = Color(44, 181, 100)
BLUE_FACE = Color(53, 111, 224)

FACE_COLORS = {
    (1, 0, 0): RED_FACE,
    (-1, 0, 0): ORANGE_FACE,
    (0, 1, 0): WHITE_FACE,
    (0, -1, 0): YELLOW_FACE,
    (0, 0, 1): GREEN_FACE,
    (0, 0, -1): BLUE_FACE,
}


@dataclass
class Cubie:
    node: Group3D
    coord: tuple[int, int, int]


def sticker(face: tuple[int, int, int], color: Color):
    x, y, z = face
    if x:
        size = Vec3(STICKER_THICKNESS, STICKER_SIDE, STICKER_SIDE)
        pose = Transform3D.translation(x * STICKER_OFFSET, 0, 0)
    elif y:
        size = Vec3(STICKER_SIDE, STICKER_THICKNESS, STICKER_SIDE)
        pose = Transform3D.translation(0, y * STICKER_OFFSET, 0)
    else:
        size = Vec3(STICKER_SIDE, STICKER_SIDE, STICKER_THICKNESS)
        pose = Transform3D.translation(0, 0, z * STICKER_OFFSET)
    return Box3D(size, color=color, transform=pose)


def make_cubie(coord: tuple[int, int, int]) -> Cubie:
    x, y, z = coord
    children = [Box3D(Vec3(CUBIE_SIDE, CUBIE_SIDE, CUBIE_SIDE), color=BODY)]
    for face, color in FACE_COLORS.items():
        fx, fy, fz = face
        if (fx and x == fx) or (fy and y == fy) or (fz and z == fz):
            children.append(sticker(face, color))
    node = Group3D(children, position=(x * SPACING, y * SPACING, z * SPACING))
    return Cubie(node, coord)


def rotate_coord(
    coord: tuple[int, int, int], axis: str, quarter: int
) -> tuple[int, int, int]:
    x, y, z = coord
    sign = 1 if quarter > 0 else -1
    for _ in range(abs(quarter) % 4):
        if axis == "x":
            y, z = (-z, y) if sign > 0 else (z, -y)
        elif axis == "y":
            x, z = (z, -x) if sign > 0 else (-z, x)
        elif axis == "z":
            x, y = (-y, x) if sign > 0 else (y, -x)
        else:
            raise ValueError(f"unknown turn axis {axis!r}")
    return x, y, z


def rotation(axis: str, quarter: int) -> SO3:
    angle = quarter * (pi / 2)
    if axis == "x":
        return SO3.rotation_x(angle)
    if axis == "y":
        return SO3.rotation_y(angle)
    if axis == "z":
        return SO3.rotation_z(angle)
    raise ValueError(f"unknown turn axis {axis!r}")


def turn(
    scene: Scene,
    cubies: list[Cubie],
    axis: str,
    layer: int,
    quarter: int,
    *,
    duration: float = TURN_DURATION,
) -> None:
    axis_index = {"x": 0, "y": 1, "z": 2}[axis]
    moving = [cubie for cubie in cubies if cubie.coord[axis_index] == layer]
    delta = SE3(rotation=rotation(axis, quarter))
    with scene.parallel(duration=duration):
        for cubie in moving:
            scene.on(cubie.node).transform(by=delta, frame=PARENT)
    for cubie in moving:
        cubie.coord = rotate_coord(cubie.coord, axis, quarter)


# notation, axis, layer, right-hand quarter turns
SCRAMBLE = (
    ("R", "x", 1, -1),
    ("U", "y", 1, 1),
    ("F", "z", 1, -1),
    ("L", "x", -1, 1),
    ("D", "y", -1, -1),
    ("B", "z", -1, 1),
    ("R", "x", 1, -1),
    ("U'", "y", 1, -1),
)


class RubiksCube(Scene):
    def __init__(self) -> None:
        super().__init__(
            canvas=CANVAS,
            fps=60,
            camera3d=Camera3D(
                position=Vec3(6.4, 5.2, 7.6),
                target=Vec3(0.0, 0.05, 0.0),
                fov_y_degrees=34.0,
            ),
        )

    def setup(self) -> None:
        self.cubies = [
            make_cubie((x, y, z))
            for x in (-1, 0, 1)
            for y in (-1, 0, 1)
            for z in (-1, 0, 1)
        ]
        root_rotation = SO3.rotation_y(-0.28) @ SO3.rotation_x(0.18)
        self.cube = Group3D(
            [cubie.node for cubie in self.cubies],
            transform=SE3(rotation=root_rotation).as_affine(),
            opacity=0.0,
        )
        self.pedestal = Box3D(
            Vec3(5.8, 0.08, 5.2),
            color=Color(25, 29, 36),
            transform=Transform3D.translation(0, -1.72, 0),
        )
        self.title = Text(
            "Rubik's Cube · scramble",
            font_size=31,
            color=WHITE,
            opacity=0.0,
            z_index=20,
        )
        self.title.move_to((0, 2.83))
        self.move_text = Text(
            "R", font_size=27, color=Color(157, 181, 222), opacity=0.0, z_index=20
        )
        self.move_text.move_to((5.15, -2.62))

    def construct(self) -> None:
        scene = self
        cubies = self.cubies
        pedestal, cube, title, move_text = scene.add(
            self.pedestal, self.cube, self.title, self.move_text
        )
        scene.wait(0.35)
        with scene.parallel(duration=0.75):
            cube.fade_in()
            title.fade_in()
            move_text.fade_in()
        scene.wait(0.25)

        for index, (notation, axis, layer, quarter) in enumerate(SCRAMBLE):
            if index:
                target = Text(notation, font_size=27, color=Color(157, 181, 222))
                target.move_to((5.15, -2.62))
                move_text.morph(to=target, duration=0.18)
            turn(scene, cubies, axis, layer, quarter)
            scene.wait(TURN_PAUSE)

        scene.wait(0.3)
        solve_title = Text("Rubik's Cube · reverse solve", font_size=31, color=WHITE)
        solve_title.move_to((0, 2.83))
        title.morph(to=solve_title, duration=0.45)
        scene.wait(0.15)

        for notation, axis, layer, quarter in reversed(SCRAMBLE):
            shown = (
                notation.removesuffix("'") if notation.endswith("'") else notation + "'"
            )
            target = Text(shown, font_size=27, color=Color(157, 181, 222))
            target.move_to((5.15, -2.62))
            move_text.morph(to=target, duration=0.16)
            turn(scene, cubies, axis, layer, -quarter)
            scene.wait(TURN_PAUSE)

        scene.wait(0.8)
        if any(
            cubie.coord != original
            for cubie, original in zip(
                cubies,
                [(x, y, z) for x in (-1, 0, 1) for y in (-1, 0, 1) for z in (-1, 0, 1)],
            )
        ):
            raise AssertionError(
                "reverse move sequence did not restore cubie coordinates"
            )


if __name__ == "__main__":
    scene = RubiksCube()
    scene._run_authoring_hooks()
    scene.preview()
