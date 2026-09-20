"""Faithful Zanim port of the uploaded Manim neural-network forward-pass demo.

The geometry is driven by the same W1/b1 -> tanh computation that later
drives the network-node values.  The scene is exactly 10 seconds and keeps the
Manim reference timing:
0-1 input geometry, 1-2.6 affine, 2.6-4.2 tanh, 4.2-5.4 layout,
5.4-10 signal propagation and output highlight.
"""

from __future__ import annotations

from math import floor
from pathlib import Path

import numpy as np
from zanim import Canvas, Circle, Color, Group, Rectangle, Scene, Text, Vec2
from zanim.batch import BatchObject2D, CircleSet, DynamicBatchObject2D, LineSet

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "media/extras/neural_forward_pass.mp4"

BG = Color(8, 11, 16)
BLUE = Color(88, 185, 242)
GOLD = Color(255, 209, 102)
MUTED = Color(105, 120, 135)
WHITE = Color(255, 255, 255)

W1 = np.array([[1.15, 0.75], [-0.35, 1.10]], dtype=np.float64)
B1 = np.array([0.15, -0.10], dtype=np.float64)
W2 = np.array([[1.10, -0.65], [-0.75, 1.20]], dtype=np.float64)
B2 = np.array([-0.15, 0.10], dtype=np.float64)
SAMPLE = np.array([1.25, 0.60], dtype=np.float64)

SCALE = 1.4
UNIT = 135.0
LINE_PX = 1.0 / UNIT
NODE_STROKE = 2.0 / UNIT

T_INPUT_END = 1.0
T_AFFINE_END = 2.6
T_TANH_END = 4.2
T_LAYOUT_END = 5.4
T_INPUT_HIGHLIGHT_END = 5.9
T_HIDDEN_PULSE_END = 6.8
T_HIDDEN_HIGHLIGHT_END = 7.3
T_OUTPUT_PULSE_END = 8.2
T_OUTPUT_HIGHLIGHT_END = 8.8
T_WINNER_END = 9.2
T_END = 10.0


def forward(x: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    z = W1 @ x + B1
    h = np.tanh(z)
    logits = W2 @ h + B2
    exp = np.exp(logits - np.max(logits))
    return z, h, exp / exp.sum()


def smooth01(value: float) -> float:
    p = max(0.0, min(1.0, float(value)))
    return p * p * (3.0 - 2.0 * p)


def progress(time: float, start: float, end: float, *, smooth: bool = True) -> float:
    if end <= start:
        return 1.0 if time >= end else 0.0
    p = (time - start) / (end - start)
    return smooth01(p) if smooth else max(0.0, min(1.0, p))


def coord(xy: np.ndarray | tuple[float, float]) -> np.ndarray:
    p = np.asarray(xy, dtype=np.float64)
    return np.array([SCALE * p[0], SCALE * p[1]], dtype=np.float64)


def affine_xy(point: np.ndarray) -> np.ndarray:
    return coord(W1 @ (point / SCALE) + B1)


def activate_xy(point: np.ndarray) -> np.ndarray:
    return coord(np.tanh(point / SCALE))


def transform_point(base: np.ndarray, time: float) -> np.ndarray:
    point = np.asarray(base, dtype=np.float64)
    if time < T_INPUT_END:
        out = point
    elif time < T_AFFINE_END:
        p = progress(time, T_INPUT_END, T_AFFINE_END)
        target = affine_xy(point)
        out = point + (target - point) * p
    elif time < T_TANH_END:
        affine_point = affine_xy(point)
        p = progress(time, T_AFFINE_END, T_TANH_END)
        target = activate_xy(affine_point)
        out = affine_point + (target - affine_point) * p
    else:
        out = activate_xy(affine_xy(point))

    if time >= T_TANH_END:
        p = progress(time, T_TANH_END, T_LAYOUT_END)
        target = 0.83 * out + np.array([-4.25, 0.0])
        out = out + (target - out) * p
    return out


def line_color(opacity: float) -> Color:
    return BLUE.with_alpha(round(255 * opacity))


def _grid_paths() -> tuple[tuple[np.ndarray, ...], ...]:
    paths: list[tuple[np.ndarray, ...]] = []
    for x in np.linspace(-2.0, 2.0, 17):
        paths.append(tuple(coord((x, y)) for y in np.linspace(-1.5, 1.5, 81)))
    for y in np.linspace(-1.5, 1.5, 13):
        paths.append(tuple(coord((x, y)) for x in np.linspace(-2.0, 2.0, 101)))
    return tuple(paths)


GRID_PATHS = _grid_paths()
GRID_OPACITY = tuple(
    [0.55 if abs(x) < 1e-8 else 0.23 for x in np.linspace(-2.0, 2.0, 17)]
    + [0.55 if abs(y) < 1e-8 else 0.23 for y in np.linspace(-1.5, 1.5, 13)]
)


def grid_geometry(time: float) -> LineSet:
    reveal = progress(time, 0.0, 0.8)
    starts: list[Vec2] = []
    ends: list[Vec2] = []
    colors: list[Color] = []
    widths: list[float] = []
    for path, opacity in zip(GRID_PATHS, GRID_OPACITY, strict=True):
        segment_count = len(path) - 1
        visible = reveal * segment_count
        whole = min(segment_count, floor(visible))
        fraction = max(0.0, min(1.0, visible - whole))
        transformed = [transform_point(point, time) for point in path]
        for index in range(whole):
            starts.append(Vec2(*transformed[index]))
            ends.append(Vec2(*transformed[index + 1]))
            colors.append(line_color(opacity))
            widths.append(LINE_PX)
        if whole < segment_count and fraction > 1e-9:
            a = transformed[whole]
            b = transformed[whole + 1]
            end = a + (b - a) * fraction
            starts.append(Vec2(*a))
            ends.append(Vec2(*end))
            colors.append(line_color(opacity))
            widths.append(LINE_PX)

    # A batch cannot be empty, so retain one fully transparent zero-length line
    # during the exact t=0 sample.
    if not starts:
        starts.append(Vec2())
        ends.append(Vec2(1e-9, 0.0))
        colors.append(BLUE.with_alpha(0))
        widths.append(LINE_PX)
    return LineSet(tuple(starts), tuple(ends), tuple(colors), tuple(widths))


_rng = np.random.default_rng(31)
POINTS = np.concatenate(
    [
        _rng.normal([-1.0, -0.30], [0.39, 0.40], (36, 2)),
        _rng.normal([0.95, 0.35], [0.40, 0.38], (36, 2)),
    ]
)
POINTS_BASE = tuple(coord(point) for point in POINTS)
SELECTED_BASE = coord(SAMPLE)


def cloud_geometry(time: float) -> CircleSet:
    centers = tuple(Vec2(*transform_point(point, time)) for point in POINTS_BASE)
    fills = tuple(BLUE if index < 36 else GOLD for index in range(len(centers)))
    return CircleSet(centers, tuple(0.035 for _ in centers), fills)


def selected_geometry(time: float) -> CircleSet:
    point = transform_point(SELECTED_BASE, time)
    return CircleSet((Vec2(*point),), (0.065,), (GOLD,))


COLUMNS = (-0.1, 2.55, 5.2)
YS = (0.95, -0.95)
NODE_POSITIONS = tuple(Vec2(x, y) for x in COLUMNS for y in YS)


def edge_geometry() -> LineSet:
    starts: list[Vec2] = []
    ends: list[Vec2] = []
    colors: list[Color] = []
    widths: list[float] = []
    for layer_index, weights in enumerate((W1, W2)):
        for j in range(2):
            for i in range(2):
                a = np.array([COLUMNS[layer_index], YS[i]], dtype=np.float64)
                b = np.array([COLUMNS[layer_index + 1], YS[j]], dtype=np.float64)
                direction = b - a
                direction /= np.linalg.norm(direction)
                starts.append(Vec2(*(a + 0.36 * direction)))
                ends.append(Vec2(*(b - 0.36 * direction)))
                weight = float(weights[j, i])
                color = GOLD if weight > 0 else BLUE
                colors.append(color.with_alpha(round(255 * 0.34)))
                widths.append((1.0 + abs(weight)) / UNIT)
    return LineSet(tuple(starts), tuple(ends), tuple(colors), tuple(widths))


def blend_color(a: Color, b: Color, p: float) -> Color:
    return Color(
        round(a.r + (b.r - a.r) * p),
        round(a.g + (b.g - a.g) * p),
        round(a.b + (b.b - a.b) * p),
        round(a.a + (b.a - a.a) * p),
    )


Z_VALUE, H_VALUE, OUT_VALUE = forward(SAMPLE)
VALUES = (SAMPLE, H_VALUE, OUT_VALUE)


def node_target(layer: int, value: float) -> tuple[Color, Color]:
    if layer == 0:
        color = BLUE
        alpha = 0.12 + 0.30 * min(abs(float(value)), 1.0)
    else:
        color = GOLD if value >= 0 else BLUE
        alpha = 0.10 + 0.45 * min(abs(float(value)), 1.0)
    return color.with_alpha(round(255 * alpha)), color


def node_geometry(time: float) -> CircleSet:
    fills: list[Color] = []
    strokes: list[Color] = []
    for layer, values in enumerate(VALUES):
        start, end = (
            (T_LAYOUT_END, T_INPUT_HIGHLIGHT_END)
            if layer == 0
            else (T_HIDDEN_PULSE_END, T_HIDDEN_HIGHLIGHT_END)
            if layer == 1
            else (T_OUTPUT_PULSE_END, T_OUTPUT_HIGHLIGHT_END)
        )
        p = progress(time, start, end)
        for value in values:
            target_fill, target_stroke = node_target(layer, float(value))
            fills.append(blend_color(BG, target_fill, p))
            strokes.append(blend_color(MUTED, target_stroke, p))
    return CircleSet(
        NODE_POSITIONS,
        tuple(0.34 for _ in NODE_POSITIONS),
        tuple(fills),
        tuple(strokes),
        tuple(NODE_STROKE for _ in NODE_POSITIONS),
    )


def pulse_geometry(layer: int, time: float) -> CircleSet:
    if layer == 0:
        start_time, end_time = T_INPUT_HIGHLIGHT_END, T_HIDDEN_PULSE_END
    else:
        start_time, end_time = T_HIDDEN_HIGHLIGHT_END, T_OUTPUT_PULSE_END
    p = progress(time, start_time, end_time, smooth=False)
    weights = (W1, W2)[layer]
    source = VALUES[layer]
    centers: list[Vec2] = []
    radii: list[float] = []
    fills: list[Color] = []
    for index in range(4):
        j, i = divmod(index, 2)
        a = np.array([COLUMNS[layer], YS[i]], dtype=np.float64)
        b = np.array([COLUMNS[layer + 1], YS[j]], dtype=np.float64)
        direction = b - a
        direction /= np.linalg.norm(direction)
        start = a + 0.36 * direction
        end = b - 0.36 * direction
        center = start + (end - start) * p
        contribution = float(weights[j, i] * source[i])
        centers.append(Vec2(*center))
        radii.append(0.035 + 0.028 * min(abs(contribution), 1.0))
        fills.append(GOLD if contribution >= 0 else BLUE)
    return CircleSet(tuple(centers), tuple(radii), tuple(fills))


def value_group(layer: int) -> Group:
    values = VALUES[layer]
    labels = []
    for value, position in zip(values, NODE_POSITIONS[layer * 2 : layer * 2 + 2], strict=True):
        text = f"{value:+.2f}" if layer < 2 else f"{value:.2f}"
        label = Text(text, font_size=19, color=WHITE, opacity=1.0)
        label.move_to(position)
        labels.append(label)
    return Group(labels, opacity=0.0, z_index=10)


class NeuralForwardPass(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(1920, 1080, UNIT)
        self.fps = 60

        self.background = Rectangle(
            16.0, 9.0, fill=BG, stroke=None, z_index=-100
        )
        self.grid = DynamicBatchObject2D(grid_geometry, z_index=0)
        self.cloud = DynamicBatchObject2D(cloud_geometry, opacity=0.0, z_index=2)
        self.selected = DynamicBatchObject2D(selected_geometry, opacity=0.0, z_index=5)

        self.stage = Text("x", font_size=28, color=BLUE, opacity=0.0, z_index=12)
        self.stage.move_to((0.0, 3.6))

        edges = BatchObject2D(edge_geometry(), z_index=0)
        nodes = DynamicBatchObject2D(node_geometry, z_index=2)
        headings = Group(
            [
                Text("x", font_size=24, color=BLUE).move_to((COLUMNS[0], 2.25)),
                Text("tanh", font_size=24, color=GOLD).move_to((COLUMNS[1], 2.25)),
                Text("softmax", font_size=24, color=GOLD).move_to((COLUMNS[2], 2.25)),
            ],
            z_index=8,
        )
        self.network = Group(
            [edges, nodes, headings],
            position=(-0.25, 0.0),
            opacity=0.0,
            z_index=0,
        )
        self.value_labels = tuple(value_group(layer) for layer in range(3))

    def construct(self) -> None:
        self.add(self.background, self.grid)
        cloud, selected, stage = self.add(self.cloud, self.selected, self.stage)
        with self.parallel(duration=0.8):
            cloud.fade_in()
            selected.fade_in()
            stage.fade_in()
        self.wait(0.2)

        stage.morph(to=Text("Wx + b", font_size=28, color=BLUE), duration=1.6)
        stage.morph(to=Text("tanh(Wx + b)", font_size=28, color=GOLD), duration=1.6)

        network = self.add(self.network)
        with self.parallel(duration=1.2):
            network.fade_in()
            network.affine(position=(0.0, 0.0))
            stage.affine(position=(-4.25, 2.25), scale=0.72)

        selected_final = transform_point(SELECTED_BASE, T_LAYOUT_END)
        halo = Circle(
            0.13,
            stroke=GOLD,
            stroke_width=2.0 / UNIT,
            position=Vec2(*selected_final),
            trim=0.0,
            z_index=9,
        )
        halo_bound = self.add(halo)
        input_labels = self.add(self.value_labels[0])
        with self.parallel(duration=0.5):
            halo_bound.create()
            input_labels.fade_in()

        pulse1 = DynamicBatchObject2D(lambda time: pulse_geometry(0, time), z_index=11)
        self.add(pulse1)
        self.wait(0.9)
        self.remove(pulse1)

        hidden_labels = self.add(self.value_labels[1])
        hidden_labels.fade_in(duration=0.5)

        pulse2 = DynamicBatchObject2D(lambda time: pulse_geometry(1, time), z_index=11)
        self.add(pulse2)
        self.wait(0.9)
        self.remove(pulse2)

        output_labels = self.add(self.value_labels[2])
        output_labels.fade_in(duration=0.6)

        winner = int(np.argmax(OUT_VALUE))
        ring = Circle(
            0.43,
            stroke=GOLD,
            stroke_width=2.0 / UNIT,
            position=NODE_POSITIONS[4 + winner],
            trim=0.0,
            z_index=9,
        )
        ring_bound = self.add(ring)
        with self.parallel(duration=0.4):
            ring_bound.create()
            halo_bound.scale(by=1.3, about=Vec2(*selected_final))

        self.wait(0.8)


def main() -> None:
    scene = NeuralForwardPass()
    scene._run_authoring_hooks()
    output = scene.render_video(
        OUTPUT,
        fps=60,
        workers=8,
        verify_random_access=True,
    )
    print(output)
    print(f"duration={scene.duration:.2f}s")
    print(f"sample={SAMPLE.tolist()} z={Z_VALUE.tolist()} h={H_VALUE.tolist()} out={OUT_VALUE.tolist()}")
    print("random-access=ok")


if __name__ == "__main__":
    main()
