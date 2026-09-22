"""Moving planar electric field shown as sampled vectors and field lines."""

from __future__ import annotations

from dataclasses import dataclass
from math import cos, sin, sqrt, tau

from zanim import (
    BLUE,
    CYAN,
    RED,
    WHITE,
    Axes,
    Canvas,
    Circle,
    Color,
    DynamicVectorField,
    Group,
    Scene,
    Simulation,
    Text,
    Vec2,
)

CANVAS = Canvas(1280, 720, 110)
X_RANGE = (-5.4, 5.4)
Y_RANGE = (-2.7, 2.7)
CHARGE_RADIUS = 0.23
ORBIT_X = 1.65
ORBIT_Y = 0.72
ORBIT_PERIOD = 7.8
OMEGA = tau / ORBIT_PERIOD


def charge_positions_from_angle(theta: float) -> tuple[Vec2, Vec2]:
    offset = Vec2(ORBIT_X * cos(theta), ORBIT_Y * sin(theta))
    return -offset, offset


def charge_positions(time: float) -> tuple[Vec2, Vec2]:
    return charge_positions_from_angle(OMEGA * float(time))


def electric_field(point: Vec2, time: float) -> Vec2:
    """Dimensionless Coulomb field of two moving, opposite point charges."""
    positive, negative = charge_positions(time)
    total = Vec2()
    softening_sq = 0.055**2
    for center, charge in ((positive, 1.0), (negative, -1.0)):
        delta = point - center
        radius_sq = delta.x * delta.x + delta.y * delta.y + softening_sq
        total += delta * (charge / (radius_sq * sqrt(radius_sq)))
    return total


def field_color(_point: Vec2, _vector: Vec2, magnitude: float) -> Color:
    strength = magnitude / (magnitude + 0.55)
    return Color(93, 176, 255, round(105 + 140 * strength))


def charge_object(value: float) -> Group:
    color = RED if value > 0 else BLUE
    disk = Circle(
        CHARGE_RADIUS,
        fill=color.with_alpha(220),
        stroke=WHITE.with_alpha(225),
        stroke_width=0.025,
        z_index=6,
    )
    symbol = Text(
        "+" if value > 0 else "−",
        font_size=28,
        color=WHITE,
        z_index=7,
    )
    return Group([disk, symbol], opacity=0.0, z_index=6)


def field_line_seeds(time: float, count: int = 24) -> tuple[Vec2, ...]:
    positive, _negative = charge_positions(time)
    radius = CHARGE_RADIUS + 0.085
    return tuple(
        positive + Vec2(cos(tau * i / count), sin(tau * i / count)) * radius
        for i in range(count)
    )


def near_charge(point: Vec2, time: float) -> bool:
    return any(
        (point - center).length < CHARGE_RADIUS * 0.88
        for center in charge_positions(time)
    )


@dataclass
class OrbitState:
    theta: float = 0.0


def step_orbit(state: OrbitState, dt: float) -> None:
    state.theta += OMEGA * dt


class ElectricField(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60

        axes = Axes(
            X_RANGE,
            Y_RANGE,
            width=X_RANGE[1] - X_RANGE[0],
            height=Y_RANGE[1] - Y_RANGE[0],
        )
        self.grid = axes.grid_object(
            x_step=0.6,
            y_step=0.6,
            color=Color(92, 105, 130, 32),
            width=0.008,
        )
        self.vector_field = DynamicVectorField(
            electric_field,
            x_range=X_RANGE,
            y_range=Y_RANGE,
            step=0.6,
            show_points=True,
            point_radius=0.018,
            point_color=Color(165, 177, 198, 100),
            color=field_color,
            stroke_width=0.017,
            vector_length=0.31,
            normalize=True,
            tip_length=0.085,
            tip_width=0.075,
            opacity=0.0,
            z_index=2,
        )
        self.positive = charge_object(1.0)
        self.negative = charge_object(-1.0)
        self.title = Text(
            "Moving electric field · sampled vectors",
            font_size=31,
            color=WHITE,
            opacity=0.0,
        )
        self.title.move(to=Vec2(0.0, 2.96))
        self.orbit = Simulation(
            OrbitState(), step_orbit, hz=240, checkpoint_interval=0.5
        )

    def construct(self) -> None:
        scene = self
        grid, vectors, positive, negative, title = scene.add(
            self.grid, self.vector_field, self.positive, self.negative, self.title
        )
        orbit = self.orbit
        scene.bind(
            positive,
            orbit,
            position=lambda state: charge_positions_from_angle(state.theta)[0],
        )
        scene.bind(
            negative,
            orbit,
            position=lambda state: charge_positions_from_angle(state.theta)[1],
        )

        scene.wait(0.45)
        with scene.parallel(duration=0.8):
            vectors.fade_in()
            positive.fade_in()
            negative.fade_in()
            title.fade_in()

        scene.wait(2.0)

        # The field lines are instantaneous integral curves of the same moving
        # Coulomb field. They only enter the Scene when this view becomes visible,
        # so we do not spend the first half of the video integrating hidden lines.
        lines = self.vector_field.streamlines(
            field_line_seeds,
            direction="forward",
            step=0.045,
            max_steps=720,
            stop=near_charge,
            color=CYAN.with_alpha(210),
            stroke_width=0.021,
            opacity=0.0,
            z_index=3,
        )
        lines = scene.add(lines)

        next_title = Text(
            "Moving electric field · field lines", font_size=31, color=WHITE
        )
        next_title.move(to=Vec2(0.0, 2.96))
        with scene.parallel(duration=1.0):
            vectors.fade_out()
            lines.fade_in()
            title.morph(to=next_title)

        scene.wait(2.7)


if __name__ == "__main__":
    scene = ElectricField()
    scene._run_authoring_hooks()
    scene.preview()
