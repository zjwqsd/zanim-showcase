"""Faithful Zanim port of JAnim's BallsCollisionExample."""

from __future__ import annotations

from dataclasses import dataclass
from math import cos, sin, tau

import numpy as np

from zanim import *

LEFT = -4.0
RIGHT = 4.0
BOTTOM = -3.0
TOP = 3.0
RADIUS = 0.25
BALL_COUNT = 25
FPS = 60.0
DURATION = 12.0


@dataclass
class BallWorld:
    positions: np.ndarray
    velocities: np.ndarray


def initial_world() -> BallWorld:
    rng = np.random.default_rng(1234)
    positions: list[np.ndarray] = []
    velocities: list[np.ndarray] = []

    for _ in range(BALL_COUNT):
        while True:
            pos = np.array(
                [
                    rng.uniform(LEFT + RADIUS, RIGHT - RADIUS),
                    rng.uniform(BOTTOM + RADIUS, TOP - RADIUS),
                ],
                dtype=float,
            )
            if all(np.linalg.norm(pos - other) >= 2 * RADIUS for other in positions):
                break
        positions.append(pos)
        velocities.append(
            np.array(
                [
                    rng.uniform(-3, 3),
                    rng.uniform(-3, 3),
                ],
                dtype=float,
            )
        )

    return BallWorld(np.stack(positions), np.stack(velocities))


def clone_world(world: BallWorld) -> BallWorld:
    return BallWorld(world.positions.copy(), world.velocities.copy())


def step_world(world: BallWorld, dt: float) -> None:
    world.positions += world.velocities * dt

    for i in range(BALL_COUNT):
        pos = world.positions[i]
        speed = world.velocities[i]

        if pos[0] - RADIUS < LEFT:
            pos[0] = LEFT + RADIUS
            speed[0] = abs(speed[0])
        elif pos[0] + RADIUS > RIGHT:
            pos[0] = RIGHT - RADIUS
            speed[0] = -abs(speed[0])

        if pos[1] - RADIUS < BOTTOM:
            pos[1] = BOTTOM + RADIUS
            speed[1] = abs(speed[1])
        elif pos[1] + RADIUS > TOP:
            pos[1] = TOP - RADIUS
            speed[1] = -abs(speed[1])

    for i in range(BALL_COUNT):
        for j in range(i + 1, BALL_COUNT):
            p1 = world.positions[i]
            p2 = world.positions[j]
            delta = p2 - p1
            dist = float(np.linalg.norm(delta))
            min_dist = 2 * RADIUS
            if dist >= min_dist:
                continue

            if dist < 1e-8:
                normal = np.array([1.0, 0.0])
                dist = 0.0
            else:
                normal = delta / dist

            v1 = world.velocities[i]
            v2 = world.velocities[j]
            velocity_along_normal = float(np.dot(v2 - v1, normal))
            if velocity_along_normal < 0:
                impulse = velocity_along_normal * normal
                world.velocities[i] = v1 + impulse
                world.velocities[j] = v2 - impulse

            overlap = min_dist - dist
            if overlap > 0:
                correction = normal * (overlap / 2)
                world.positions[i] -= correction
                world.positions[j] += correction


def simulation_time(scene_time: float) -> float:
    if scene_time <= 4.0:
        return scene_time
    if scene_time < 6.0:
        return 4.0
    return min(10.0, scene_time - 2.0)


def smoothstep(value: float) -> float:
    x = max(0.0, min(1.0, value))
    return x * x * (3 - 2 * x)


class BallsCollisionExample(Scene):
    def setup(self):
        self.canvas = Canvas(1920, 1080, 135)
        self.fps = 60
        self.simulation = Simulation(
            initial_world(),
            step_world,
            hz=FPS,
            checkpoint_interval=0.5,
            clone=clone_world,
        )

        self.arena = Rectangle(
            RIGHT - LEFT,
            TOP - BOTTOM,
            fill=BLUE.with_alpha(51),
            stroke=BLUE,
        )

        def ball_geometry(index: int):
            def provider(time: float):
                world = self.simulation.state_at(simulation_time(time))
                x, y = world.positions[index]
                return Polygon(
                    [
                        (
                            x + RADIUS * cos(tau * k / 32),
                            y + RADIUS * sin(tau * k / 32),
                        )
                        for k in range(32)
                    ]
                ).geometry

            return provider

        self.balls = [
            DynamicGeometryObject2D(
                ball_geometry(index),
                style=Style.solid(BLUE),
                z_index=1,
            )
            for index in range(BALL_COUNT)
        ]

        self.target_at_four = self.simulation.state_at(4.0).positions[6].copy()

    def construct(self):
        target = self.add(self.arena, *self.balls)[7]
        self.wait(4.5)

        x0, y0 = map(float, self.target_at_four)

        def zoom_to_target(alpha: float):
            a = smoothstep(alpha)
            scale = 1.0 + a
            cx, cy = x0 * a, y0 * a
            return affine2d(position=(-scale * cx, -scale * cy), scale=scale)

        with self.parallel(duration=1.0):
            self.camera.transform_function(zoom_to_target)
            target.style(to=Style.solid(YELLOW))

        self.wait(0.5)

        def follow_target(alpha: float):
            world = self.simulation.state_at(4.0 + 6.0 * alpha)
            cx, cy = map(float, world.positions[6])
            return affine2d(position=(-2.0 * cx, -2.0 * cy), scale=2.0)

        self.camera.transform_function(
            follow_target,
            duration=6.0,
            easing=Easing.LINEAR,
        )


if __name__ == "__main__":
    BallsCollisionExample().preview()
