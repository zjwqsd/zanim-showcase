"""Global Simulation state driving a bounded 2D elastic-collision scene."""

from __future__ import annotations

from dataclasses import dataclass
from math import cos, sin, sqrt, tau
from random import Random

from zanim import (
    BLUE,
    CYAN,
    GREEN,
    ORANGE,
    PINK,
    PURPLE,
    RED,
    WHITE,
    YELLOW,
    Canvas,
    Circle,
    Color,
    Scene,
    Simulation,
    Square,
    Vec2,
)

HALF_SIZE = 3.15
BALL_RADIUS = 0.22
BALL_COUNT = 14
SIM_HZ = 240.0
DURATION = 8.0


@dataclass
class Body:
    position: Vec2
    velocity: Vec2
    radius: float = BALL_RADIUS
    mass: float = 1.0


@dataclass
class World:
    bodies: list[Body]


def initial_world(seed: int = 7) -> World:
    rng = Random(seed)
    bodies: list[Body] = []
    limit = HALF_SIZE - BALL_RADIUS - 0.03
    for _ in range(BALL_COUNT):
        for _attempt in range(1000):
            position = Vec2(rng.uniform(-limit, limit), rng.uniform(-limit, limit))
            if all(
                (position.x - other.position.x) ** 2
                + (position.y - other.position.y) ** 2
                > (2.0 * BALL_RADIUS + 0.10) ** 2
                for other in bodies
            ):
                break
        else:
            raise RuntimeError("could not place non-overlapping balls")

        angle = rng.uniform(0.0, tau)
        speed = rng.uniform(1.15, 2.15)
        velocity = Vec2(cos(angle) * speed, sin(angle) * speed)
        bodies.append(Body(position, velocity))
    return World(bodies)


def step_world(world: World, dt: float) -> None:
    # Semi-discrete hard-sphere step. A high fixed Simulation rate keeps the
    # overlap correction small while remaining deterministic under random seek.
    for body in world.bodies:
        body.position = Vec2(
            body.position.x + body.velocity.x * dt,
            body.position.y + body.velocity.y * dt,
        )

    # Resolve walls first. Position clamping prevents numerical tunneling from
    # accumulating after a bounce.
    for body in world.bodies:
        limit = HALF_SIZE - body.radius
        x, y = body.position.x, body.position.y
        vx, vy = body.velocity.x, body.velocity.y
        if x < -limit:
            x, vx = -limit, abs(vx)
        elif x > limit:
            x, vx = limit, -abs(vx)
        if y < -limit:
            y, vy = -limit, abs(vy)
        elif y > limit:
            y, vy = limit, -abs(vy)
        body.position = Vec2(x, y)
        body.velocity = Vec2(vx, vy)

    # Frictionless, restitution=1 pair collisions. Two solver passes make
    # simultaneous contacts substantially more stable without adding a physics
    # engine dependency.
    for _ in range(2):
        for i, a in enumerate(world.bodies):
            for b in world.bodies[i + 1 :]:
                dx = b.position.x - a.position.x
                dy = b.position.y - a.position.y
                min_dist = a.radius + b.radius
                dist_sq = dx * dx + dy * dy
                if dist_sq >= min_dist * min_dist:
                    continue

                if dist_sq <= 1e-16:
                    nx, ny, dist = 1.0, 0.0, 0.0
                else:
                    dist = sqrt(dist_sq)
                    nx, ny = dx / dist, dy / dist

                inv_a = 1.0 / a.mass
                inv_b = 1.0 / b.mass
                inv_sum = inv_a + inv_b

                # Separate the pair proportionally to inverse mass.
                overlap = min_dist - dist
                correction = overlap / inv_sum
                a.position = Vec2(
                    a.position.x - nx * correction * inv_a,
                    a.position.y - ny * correction * inv_a,
                )
                b.position = Vec2(
                    b.position.x + nx * correction * inv_b,
                    b.position.y + ny * correction * inv_b,
                )

                rvx = b.velocity.x - a.velocity.x
                rvy = b.velocity.y - a.velocity.y
                normal_speed = rvx * nx + rvy * ny
                if normal_speed >= 0.0:
                    continue

                impulse = -2.0 * normal_speed / inv_sum
                ix, iy = impulse * nx, impulse * ny
                a.velocity = Vec2(
                    a.velocity.x - ix * inv_a,
                    a.velocity.y - iy * inv_a,
                )
                b.velocity = Vec2(
                    b.velocity.x + ix * inv_b,
                    b.velocity.y + iy * inv_b,
                )


class SimulationCollisions(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 100)
        self.fps = 60
        self.simulation = Simulation(
            initial_world(), step_world, hz=SIM_HZ, checkpoint_interval=0.5
        )
        self.arena = Square(
            2.0 * HALF_SIZE,
            fill=Color(18, 22, 31),
            stroke=Color(105, 116, 137),
            stroke_width=0.045,
        )
        palette = (BLUE, GREEN, RED, YELLOW, ORANGE, PURPLE, PINK, CYAN, WHITE)
        self.balls = [
            Circle(
                BALL_RADIUS,
                fill=palette[i % len(palette)],
                stroke=Color(235, 238, 245),
                stroke_width=0.018,
                z_index=1,
            )
            for i in range(BALL_COUNT)
        ]

    def construct(self) -> None:
        self.add(self.arena, *self.balls)
        for index, ball in enumerate(self.balls):
            self.bind(
                ball,
                self.simulation,
                position=lambda world, index=index: world.bodies[index].position,
            )

        self.wait(DURATION)


if __name__ == "__main__":
    scene = SimulationCollisions()
    scene._run_authoring_hooks()
    scene.preview()
