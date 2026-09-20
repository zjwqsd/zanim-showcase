"""Faithful Zanim port of the 10-second Manim neural forward-pass demo.

The geometry, data, weights, timings, labels, contribution pulses and final values
match the supplied Manim Community 0.19.0 source. The default Manim smooth
rate function is represented by Easing.SMOOTH.
"""
from __future__ import annotations

from math import exp, tanh
from pathlib import Path

import numpy as np
from zanim import (
    WORLD,
    Canvas,
    Circle,
    Color,
    Easing,
    Group,
    Rectangle,
    Scene,
    Style,
    Text,
    Transform2D,
    Vec2,
)
from zanim.batch import BatchObject2D, CircleSet, DynamicBatchObject2D, LineSet
from zanim.geometry import PolylineGeometry, StrokeStyle
from zanim.plot import DynamicGeometryObject2D

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "media/extras/neural_forward_demo.mp4"

BACKGROUND = Color(8, 11, 16)
BLUE = Color(88, 185, 242)
GOLD = Color(255, 209, 102)
MUTED = Color(105, 120, 135)
WHITE = Color(240, 242, 248)

W1 = ((1.15, 0.75), (-0.35, 1.10))
B1 = (0.15, -0.10)
W2 = ((1.10, -0.65), (-0.75, 1.20))
B2 = (-0.15, 0.10)
SAMPLE = (1.25, 0.60)

DISPLAY_SCALE = 1.4
UNIT_SIZE = 135.0
COLUMNS = (-0.1, 2.55, 5.2)
NODE_YS = (0.95, -0.95)


def _smooth(alpha: float) -> float:
    """Manim smooth(t, inflection=10), clamped and normalized."""
    t = max(0.0, min(1.0, float(alpha)))
    error = 1.0 / (1.0 + exp(5.0))
    value = 1.0 / (1.0 + exp(-10.0 * (t - 0.5)))
    return max(0.0, min(1.0, (value - error) / (1.0 - 2.0 * error)))


def _window(time: float, start: float, duration: float) -> float:
    return _smooth((time - start) / duration)


def _lerp(a: float, b: float, p: float) -> float:
    return a + (b - a) * p


def _lerp2(a: tuple[float, float], b: tuple[float, float], p: float) -> tuple[float, float]:
    return (_lerp(a[0], b[0], p), _lerp(a[1], b[1], p))


def _mix_color(a: Color, b: Color, p: float) -> Color:
    return Color(
        round(_lerp(a.r, b.r, p)),
        round(_lerp(a.g, b.g, p)),
        round(_lerp(a.b, b.b, p)),
        round(_lerp(a.a, b.a, p)),
    )


def _matvec(matrix, vector: tuple[float, float]) -> tuple[float, float]:
    return (
        matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
        matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
    )


def _add(a: tuple[float, float], b: tuple[float, float]) -> tuple[float, float]:
    return (a[0] + b[0], a[1] + b[1])


def forward(x: tuple[float, float]):
    z = _add(_matvec(W1, x), B1)
    h = (tanh(z[0]), tanh(z[1]))
    logits = _add(_matvec(W2, h), B2)
    peak = max(logits)
    e0, e1 = exp(logits[0] - peak), exp(logits[1] - peak)
    total = e0 + e1
    return z, h, (e0 / total, e1 / total)


def _affine(point: tuple[float, float]) -> tuple[float, float]:
    return _add(_matvec(W1, point), B1)


def _activate(point: tuple[float, float]) -> tuple[float, float]:
    return (tanh(point[0]), tanh(point[1]))


def _data_point(point: tuple[float, float], time: float) -> tuple[float, float]:
    if time <= 1.0:
        value = point
    elif time < 2.6:
        value = _lerp2(point, _affine(point), _window(time, 1.0, 1.6))
    elif time < 4.2:
        z = _affine(point)
        value = _lerp2(z, _activate(z), _window(time, 2.6, 1.6))
    else:
        value = _activate(_affine(point))

    world = (DISPLAY_SCALE * value[0], DISPLAY_SCALE * value[1])
    if time <= 4.2:
        return world
    u = _window(time, 4.2, 1.2)
    return ((1.0 - 0.17 * u) * world[0] - 4.25 * u, (1.0 - 0.17 * u) * world[1])


def _shape_radius(radius: float, time: float) -> float:
    if time <= 4.2:
        return radius
    return radius * (1.0 - 0.17 * _window(time, 4.2, 1.2))


def _grid_line(points, *, major: bool) -> DynamicGeometryObject2D:
    color = BLUE.with_alpha(round(255 * (0.55 if major else 0.23)))

    def geometry(time: float):
        return PolylineGeometry(tuple(Vec2(*_data_point(point, time)) for point in points))

    obj = DynamicGeometryObject2D(
        geometry,
        style=Style(fill=None, stroke=StrokeStyle(color, 1.0 / UNIT_SIZE)),
        z_index=0,
    )
    obj.trim = 0.0
    return obj


def _point_cloud(points: tuple[tuple[float, float], ...]) -> DynamicBatchObject2D:
    fills = tuple(BLUE if i < 36 else GOLD for i in range(len(points)))

    def provider(time: float):
        return CircleSet(
            tuple(Vec2(*_data_point(point, time)) for point in points),
            tuple(_shape_radius(0.035, time) for _ in points),
            fills,
        )

    return DynamicBatchObject2D(provider, opacity=0.0, z_index=3)


def _selected() -> DynamicBatchObject2D:
    def provider(time: float):
        return CircleSet(
            (Vec2(*_data_point(SAMPLE, time)),),
            (_shape_radius(0.065, time),),
            (GOLD,),
        )

    return DynamicBatchObject2D(provider, opacity=0.0, z_index=5)


def _node_positions() -> tuple[tuple[float, float], ...]:
    return tuple((x, y) for x in COLUMNS for y in NODE_YS)


def _edge_geometry():
    node_positions = _node_positions()
    layers = []
    endpoints = []
    for k, weights in enumerate((W1, W2)):
        starts, ends, colors, widths = [], [], [], []
        layer_endpoints = []
        for j in range(2):
            for i in range(2):
                a = node_positions[k * 2 + i]
                b = node_positions[(k + 1) * 2 + j]
                dx, dy = b[0] - a[0], b[1] - a[1]
                length = (dx * dx + dy * dy) ** 0.5
                ux, uy = dx / length, dy / length
                start = (a[0] + 0.36 * ux, a[1] + 0.36 * uy)
                end = (b[0] - 0.36 * ux, b[1] - 0.36 * uy)
                weight = weights[j][i]
                starts.append(Vec2(*start))
                ends.append(Vec2(*end))
                colors.append((GOLD if weight > 0 else BLUE).with_alpha(round(255 * 0.34)))
                widths.append((1.0 + abs(weight)) / UNIT_SIZE)
                layer_endpoints.append((start, end))
        layers.append(LineSet(tuple(starts), tuple(ends), tuple(colors), tuple(widths)))
        endpoints.append(tuple(layer_endpoints))
    return tuple(layers), tuple(endpoints)


def _node_batch(values):
    targets = {
        0: (5.4, 0.5, values[0]),
        1: (6.8, 0.5, values[1]),
        2: (8.2, 0.6, values[2]),
    }
    positions = _node_positions()
    stroke_width = 2.0 / UNIT_SIZE

    def provider(time: float):
        fills, strokes = [], []
        for index, _position in enumerate(positions):
            layer = index // 2
            value = targets[layer][2][index % 2]
            start, duration, _ = targets[layer]
            p = _window(time, start, duration)
            sign_color = BLUE if layer == 0 or value < 0 else GOLD
            target_opacity = (
                0.12 + 0.30 * min(abs(value), 1.0)
                if layer == 0
                else 0.10 + 0.45 * min(abs(value), 1.0)
            )
            target_fill = sign_color.with_alpha(round(255 * target_opacity))
            fills.append(_mix_color(BACKGROUND, target_fill, p))
            strokes.append(_mix_color(MUTED, sign_color, p))
        return CircleSet(
            tuple(Vec2(*p) for p in positions),
            tuple(0.34 for _ in positions),
            tuple(fills),
            tuple(strokes),
            tuple(stroke_width for _ in positions),
        )

    return DynamicBatchObject2D(provider, z_index=4)


def _pulse_batch(values, endpoints):
    pulse_specs = []
    for layer, weights in enumerate((W1, W2)):
        source = values[layer]
        start_time = 5.9 if layer == 0 else 7.3
        for index, (start, end) in enumerate(endpoints[layer]):
            j, i = divmod(index, 2)
            contribution = weights[j][i] * source[i]
            pulse_specs.append((start_time, start, end, contribution))

    def provider(time: float):
        centers, radii, fills = [], [], []
        for start_time, start, end, contribution in pulse_specs:
            p = max(0.0, min(1.0, (time - start_time) / 0.9))
            active = start_time <= time <= start_time + 0.9
            centers.append(Vec2(_lerp(start[0], end[0], p), _lerp(start[1], end[1], p)))
            radii.append(0.035 + 0.028 * min(abs(contribution), 1.0))
            base = GOLD if contribution >= 0 else BLUE
            fills.append(base.with_alpha(255 if active else 0))
        return CircleSet(tuple(centers), tuple(radii), tuple(fills))

    return DynamicBatchObject2D(provider, z_index=7)


class NeuralForwardDemo(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(width=1920, height=1080, unit_size=UNIT_SIZE)
        self.fps = 60
        self.background = Rectangle(18.0, 11.0, fill=BACKGROUND, stroke=None, z_index=-1000)

        vertical = [
            tuple((float(x), float(y)) for y in np.linspace(-1.5, 1.5, 81))
            for x in np.linspace(-2.0, 2.0, 17)
        ]
        horizontal = [
            tuple((float(x), float(y)) for x in np.linspace(-2.0, 2.0, 101))
            for y in np.linspace(-1.5, 1.5, 13)
        ]
        self.grid = [
            _grid_line(points, major=abs(points[0][0]) < 1e-8)
            for points in vertical
        ] + [
            _grid_line(points, major=abs(points[0][1]) < 1e-8)
            for points in horizontal
        ]

        rng = np.random.default_rng(31)
        raw = np.concatenate(
            (
                rng.normal((-1.0, -0.30), (0.39, 0.40), (36, 2)),
                rng.normal((0.95, 0.35), (0.40, 0.38), (36, 2)),
            )
        )
        self.points = tuple((float(x), float(y)) for x, y in raw)
        self.cloud = _point_cloud(self.points)
        self.selected = _selected()

        self.stage = Text(
            "x", font_size=28, font="DejaVu Sans", color=BLUE, opacity=0, z_index=12
        )
        self.stage.move_to((0.0, 3.6))

        z, h, out = forward(SAMPLE)
        self.values = (SAMPLE, h, out)
        self.z = z

        edge_layers, endpoints = _edge_geometry()
        edges = [BatchObject2D(layer, z_index=2) for layer in edge_layers]
        nodes = _node_batch(self.values)
        pulses = _pulse_batch(self.values, endpoints)
        headings = [
            Text(label, font_size=24, font="DejaVu Sans", color=color, z_index=8).move_to((x, 2.25))
            for label, x, color in zip(("x", "tanh", "softmax"), COLUMNS, (BLUE, GOLD, GOLD))
        ]
        self.network = Group([*edges, nodes, pulses, *headings], position=(-0.25, 0), opacity=0.0)

        self.value_labels = []
        for layer, values in enumerate(self.values):
            labels = []
            for value, y in zip(values, NODE_YS):
                text = f"{value:+.2f}" if layer < 2 else f"{value:.2f}"
                label = Text(
                    text,
                    font_size=19,
                    font="DejaVu Sans",
                    color=WHITE,
                    opacity=0.0,
                    z_index=9,
                )
                label.move_to((COLUMNS[layer], y))
                labels.append(label)
            self.value_labels.append(tuple(labels))

        self.halo = Circle(
            0.13,
            position=_data_point(SAMPLE, 5.4),
            fill=None,
            stroke=GOLD,
            stroke_width=2.0 / UNIT_SIZE,
            trim=0.0,
            z_index=8,
        )
        winner = 0 if out[0] >= out[1] else 1
        self.ring = Circle(
            0.43,
            position=(COLUMNS[2], NODE_YS[winner]),
            fill=None,
            stroke=GOLD,
            stroke_width=2.0 / UNIT_SIZE,
            trim=0.0,
            z_index=10,
        )

    def construct(self) -> None:
        self.add(self.background)
        grid = [self.add(line) for line in self.grid]
        cloud = self.add(self.cloud)
        selected = self.add(self.selected)
        stage = self.add(self.stage)

        with self.parallel(duration=0.8):
            for line in grid:
                line.create(easing=Easing.SMOOTH)
            cloud.fade_in(easing=Easing.SMOOTH)
            selected.fade_in(easing=Easing.SMOOTH)
            stage.fade_in(easing=Easing.SMOOTH)
        self.wait(0.2)

        stage.morph(
            to=Text(
                "Wx + b",
                font_size=28,
                font="DejaVu Sans",
                color=BLUE,
                transform=Transform2D.translation(0, 3.6),
            ),
            duration=1.6,
            easing=Easing.SMOOTH,
        )
        stage.morph(
            to=Text(
                "tanh(Wx + b)",
                font_size=28,
                font="DejaVu Sans",
                color=GOLD,
                transform=Transform2D.translation(0, 3.6),
            ),
            duration=1.6,
            easing=Easing.SMOOTH,
        )

        network = self.add(self.network)
        labels = [self.add(label) for layer in self.value_labels for label in layer]
        with self.parallel(duration=1.2):
            network.fade_in(easing=Easing.SMOOTH)
            network.move(by=(0.25, 0.0), frame=WORLD, duration=1.2, easing=Easing.SMOOTH)
            stage.affine(
                position=(-4.25, 2.25),
                scale=0.72,
                duration=1.2,
                easing=Easing.SMOOTH,
            )

        halo = self.add(self.halo)
        with self.parallel(duration=0.5):
            halo.create(easing=Easing.SMOOTH)
            for label in labels[0:2]:
                label.fade_in(easing=Easing.SMOOTH)

        self.wait(0.9)
        with self.parallel(duration=0.5):
            for label in labels[2:4]:
                label.fade_in(easing=Easing.SMOOTH)

        self.wait(0.9)
        with self.parallel(duration=0.6):
            for label in labels[4:6]:
                label.fade_in(easing=Easing.SMOOTH)

        ring = self.add(self.ring)
        with self.parallel(duration=0.4):
            ring.create(easing=Easing.SMOOTH)
            halo.scale(by=1.3, about=halo.center, duration=0.4, easing=Easing.SMOOTH)

        self.wait(0.8)


def main() -> None:
    scene = NeuralForwardDemo()
    scene._run_authoring_hooks()
    output = scene.render_video(
        OUTPUT,
        fps=60,
        workers=8,
        verify_random_access=True,
    )
    print(output)
    print(f"duration={scene.duration:.2f}s")


if __name__ == "__main__":
    main()
