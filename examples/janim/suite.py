from __future__ import annotations

import argparse
import math
from pathlib import Path

from zanim import (
    DOWN,
    PARENT,
    RIGHT,
    Axes,
    Canvas,
    Circle,
    Color,
    DynamicNumber,
    Easing,
    Group,
    Line,
    Math,
    NumberFormat,
    Polygon,
    Polyline,
    Row,
    Column,
    Scene,
    Square,
    Text,
    Transform2D,
    Vec2,
    affine2d,
)
from zanim.geometry import (
    Object2D,
    PolygonGeometry,
    PolylineGeometry,
    RectangleGeometry,
)
from zanim.plot import DynamicGeometryObject2D
from zanim.vector import (
    DynamicVectorObject2D,
    VectorDocument,
    VectorPath,
    map_vector_document,
)

from .frame_effect_example import FrameEffectExample
from .mask_example import MaskExample
from .three_d_shapes_example import ThreeDShapesExample

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "media" / "janim"
CANVAS = Canvas(width=1920, height=1080, unit_size=135)
BG = Color(0, 0, 0)
WHITE = Color(255, 255, 255)
BLUE = Color(88, 196, 221)
BLUE_E = Color(34, 75, 135)
GREEN = Color(131, 193, 103)
RED = Color(252, 98, 85)
YELLOW = Color(247, 217, 111)
GOLD = Color(240, 172, 95)
ORANGE = Color(255, 134, 47)
PURPLE = Color(154, 114, 172)
MAROON = Color(197, 95, 115)
LIGHT_BROWN = Color(183, 139, 100)
PURPLE_E = Color(92, 55, 130)
TAU = math.tau
PI = math.pi


def star_points(outer=1.0, inner=0.45, count=5, phase=PI / 2):
    pts = []
    for i in range(count * 2):
        r = outer if i % 2 == 0 else inner
        a = phase + i * PI / count
        pts.append(Vec2(r * math.cos(a), r * math.sin(a)))
    return tuple(pts)


def square_polygon(
    side: float, transform: Transform2D | None = None
) -> PolygonGeometry:
    transform = transform or Transform2D()
    h = side / 2
    return PolygonGeometry(
        tuple(
            transform.apply(Vec2(x, y)) for x, y in ((-h, -h), (h, -h), (h, h), (-h, h))
        )
    )


def circle_polygon(center: Vec2, radius: float, samples=48) -> PolygonGeometry:
    return PolygonGeometry(
        tuple(
            Vec2(
                center.x + radius * math.cos(TAU * i / samples),
                center.y + radius * math.sin(TAU * i / samples),
            )
            for i in range(samples)
        )
    )


def triangle_polygon(center: Vec2, radius: float, phase=PI / 2) -> PolygonGeometry:
    return PolygonGeometry(
        tuple(
            Vec2(
                center.x + radius * math.cos(phase + TAU * i / 3),
                center.y + radius * math.sin(phase + TAU * i / 3),
            )
            for i in range(3)
        )
    )


def sector_polygon(
    start: float, sweep: float, radius: float, center=None, samples=30
) -> PolygonGeometry:
    center = center or Vec2()
    return PolygonGeometry(
        (
            center,
            *tuple(
                Vec2(
                    center.x + radius * math.cos(start + sweep * i / samples),
                    center.y + radius * math.sin(start + sweep * i / samples),
                )
                for i in range(samples + 1)
            ),
        )
    )


def add_reveal_group(sc: Scene, group: Group, duration=1.0, lag=0.04):
    raw_children = group.children
    for child in raw_children:
        if isinstance(child, (Text, Math)):
            child.reveal = 0.0
        else:
            child.opacity = 0.0

    group = sc.add(group)
    with sc.parallel():
        for i, (raw, child) in enumerate(zip(raw_children, group.children)):
            if isinstance(raw, (Text, Math)):
                child.create(duration=max(0.15, duration - lag * i), at=lag * i)
            else:
                child.fade_in(duration=max(0.15, duration - lag * i), at=lag * i)


class HelloJAnimExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.circle = Circle(1.0, stroke=BLUE, stroke_width=0.045, trim=0.0)
        self.square = Square(
            2.0, fill=GREEN.with_alpha(128), stroke=GREEN, stroke_width=0.045
        )

    def construct(self) -> None:
        circle = self.add(self.circle)
        self.wait(1)
        circle.create(duration=1)
        square = self.replace(circle, self.square, duration=1)
        square.trim(to=0.0, duration=1)
        self.wait(1)


class BasicAnimationExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.circle = Circle(1, stroke=WHITE, stroke_width=0.045, trim=0.0)
        self.star = Polygon(star_points(), stroke=WHITE, stroke_width=0.045, scale=0.0)

    def construct(self) -> None:
        circle, star = self.add(self.circle, self.star)
        self.wait(1)
        circle.create()
        circle.affine(position=(-3, 0), scale=1.5)
        circle.style(fill=RED.with_alpha(128), stroke=RED, stroke_width=0.045)
        star.transform_function(
            lambda a: affine2d(rotation=TAU * a, scale=a), duration=1
        )
        star.affine(position=(3, 0), scale=1.5)
        star.style(fill=YELLOW.with_alpha(128), stroke=YELLOW, stroke_width=0.045)
        self.wait(1)


def rich_line(parts, font_size=28):
    children = []
    for text, color, size_scale in parts:
        children.append(Text(text, font_size=font_size * size_scale, color=color))
    g = Group(children)
    Row(gap=0.02).place(*g.children)
    return g


class TextExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.title = Text("Here is some text", font_size=64, reveal=0)
        self.d0 = rich_line(
            [
                ("You can also apply ", WHITE, 1),
                ("styles", BLUE, 1),
                (" to the text.", WHITE, 1),
            ]
        )
        self.d1 = rich_line(
            [
                ("You can also apply ", WHITE, 1),
                ("styles", GREEN, 1.4),
                (" to the text.", WHITE, 1),
            ]
        )
        self.title.move(to=Vec2(0, 0.7))
        self.d0.move(to=Vec2(0, -0.6))
        self.d1.move(to=Vec2(0, -0.6))
        self.d0.opacity = 0.0
        self.d1.opacity = 0.0

    def construct(self) -> None:
        title, d0, d1 = self.add(self.title, self.d0, self.d1)
        self.wait(1)
        title.create(duration=1)
        d0.fade_in(duration=1)
        with self.parallel():
            d0.fade_out(duration=1)
            d1.fade_in(duration=1)
        self.wait(1)


class TypstExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.lines = [
            Text(
                "JAnim provides TypstText and TypstMath classes to insert Typst content.",
                font_size=27,
            ),
            Text("Math expressions are also supported.", font_size=27),
            Math("A = pi r^2", font_size=34),
            Math('"area" = pi dot "radius"^2', font_size=34),
            Math('cal(A) := { x in RR | x "is natural" }', font_size=31),
            Math("5 < 17", font_size=34),
            Text(
                "You can also use TypstDoc, which automatically align to the top of the viewport,",
                font_size=24,
            ),
            Text("instead of the center.", font_size=24),
        ]
        for item in self.lines:
            item.reveal = 0.0
        self.doc = Group(self.lines)
        Column(gap=0.25).place(*self.doc.children)
        self.doc.move(to=Vec2(0, 0.3))

        self.cells = [
            Text("TypstText", font_size=34, color=BLUE),
            Text("This is a sentence with a math expression f(x)=x²", font_size=27),
            Text("TypstMath", font_size=34, color=BLUE),
            Math("sum_(i=1)^n x_i = x_1 + x_2 + dots.c + x_n", font_size=31),
        ]
        for item in self.cells:
            item.reveal = 0.0
        self.grid = Group(self.cells)
        for item, pos in zip(
            self.cells, [Vec2(-3, 0.8), Vec2(3, 0.8), Vec2(-3, -0.8), Vec2(3, -0.8)]
        ):
            item.move(to=pos)

    def construct(self) -> None:
        doc = self.add(self.doc)
        with self.parallel():
            for i, item in enumerate(doc.children):
                item.create(duration=3.5, at=i * 0.12)
        self.wait(1)
        doc.fade_out(duration=1)

        grid = self.add(self.grid)
        with self.parallel():
            for i, item in enumerate(grid.children):
                item.create(duration=1.5, at=i * 0.10)
        self.wait(1)
        grid.fade_out(duration=1)


def token_formula(tokens, font_size=95):
    objs = [Math(tok, font_size=font_size) for tok in tokens]
    g = Group(objs)
    Row(gap=0.04).place(*g.children)
    g.move(to=Vec2())
    return g, objs


class TypstColorizeExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.specs = [
            ("cos", 95, -2.75, 0),
            ("2", 56, -2.02, 0.34),
            ("theta", 95, -1.58, 0),
            ("+", 95, -0.68, 0),
            ("sin", 95, 0.10, 0),
            ("2", 56, 0.79, 0.34),
            ("theta", 95, 1.23, 0),
            ("=", 95, 2.13, 0),
            ("1", 95, 2.86, 0),
        ]
        self.objs = [
            Math(text, font_size=size, position=(x, y))
            for text, size, x, y in self.specs
        ]

    def construct(self) -> None:
        objs = list(self.add(*self.objs))
        self.wait()

        def recolor(index, color):
            text, size, x, y = self.specs[index]
            replacement = Math(
                text,
                font_size=size,
                color=color,
                position=(x, y),
                opacity=0,
            )
            next_obj = self.add(replacement)
            with self.parallel():
                objs[index].fade_out()
                next_obj.fade_in()
            objs[index] = next_obj

        recolor(0, BLUE)
        recolor(4, BLUE)
        recolor(2, GOLD)
        recolor(6, ORANGE)
        self.wait()

        replacements = []
        for index in (2, 6):
            text, size, x, y = self.specs[index]
            replacements.append(
                (
                    index,
                    self.add(
                        Math(
                            text,
                            font_size=size,
                            color=GREEN,
                            position=(x, y),
                            opacity=0,
                        )
                    ),
                )
            )
        with self.parallel():
            for index, next_obj in replacements:
                objs[index].fade_out()
                next_obj.fade_in()
                objs[index] = next_obj

        replacements = []
        for index in (1, 5):
            _, _, x, y = self.specs[index]
            replacements.append(
                (
                    index,
                    self.add(
                        Math(
                            "2",
                            font_size=56,
                            color=RED,
                            position=(x, y),
                            opacity=0,
                        )
                    ),
                )
            )
        with self.parallel():
            for index, next_obj in replacements:
                objs[index].fade_out()
                next_obj.fade_in()
                objs[index] = next_obj

        self.wait()


def _lerp_color(a: Color, b: Color, alpha: float) -> Color:
    t = max(0.0, min(1.0, float(alpha)))
    return Color(
        round(a.r + (b.r - a.r) * t),
        round(a.g + (b.g - a.g) * t),
        round(a.b + (b.b - a.b) * t),
        round(a.a + (b.a - a.a) * t),
    )


def _recolor_vector(document: VectorDocument, color: Color) -> VectorDocument:
    return VectorDocument(
        tuple(
            VectorPath(
                path.contours,
                fill=color if path.fill is not None else None,
                stroke=path.stroke,
                group=path.group,
            )
            for path in document.paths
        ),
        document.width,
        document.height,
        document.group_count,
    )


def _pi_grid_document() -> VectorDocument:
    glyph = Math("pi", font_size=34).document
    paths = []
    group_offset = 0
    x_step, y_step = 0.68, 0.62
    for row in range(10):
        for col in range(10):
            shift = Transform2D.translation(
                (col - 4.5) * x_step,
                (4.5 - row) * y_step,
            )
            moved = map_vector_document(glyph, shift.apply)
            paths.extend(
                VectorPath(
                    path.contours,
                    fill=path.fill,
                    stroke=path.stroke,
                    group=path.group + group_offset,
                )
                for path in moved.paths
            )
            group_offset += glyph.group_count
    return VectorDocument(tuple(paths), 6.8, 6.2, group_offset)


class AnimatingPiExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.base = _pi_grid_document()

    def construct(self) -> None:
        sc = self
        base = self.base
        white = _recolor_vector(base, WHITE)
        yellow = _recolor_vector(base, YELLOW)
        blue = _recolor_vector(base, BLUE)
        shifted_yellow = map_vector_document(
            yellow, Transform2D.translation(-1, 0).apply
        )

        fit = Transform2D.scaling(0.66 / 0.68, 0.66 / 0.62)
        fitted_blue = map_vector_document(blue, fit.apply)

        def exp_point(p: Vec2) -> Vec2:
            magnitude = math.exp(p.x)
            return Vec2(magnitude * math.cos(p.y), magnitude * math.sin(p.y))

        exp_blue = map_vector_document(fitted_blue, exp_point)

        def wave_point(p: Vec2) -> Vec2:
            return Vec2(p.x + 0.5 * math.sin(p.y), p.y + 0.5 * math.sin(p.x))

        final_blue = map_vector_document(exp_blue, wave_point)

        def smooth(alpha: float) -> float:
            return Easing.SMOOTHSTEP.apply(alpha)

        def lerp_point(a: Vec2, b: Vec2, u: float) -> Vec2:
            return Vec2(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u)

        def affine_between(a: Transform2D, b: Transform2D, u: float) -> Transform2D:
            return Transform2D(
                xx=a.xx + (b.xx - a.xx) * u,
                xy=a.xy + (b.xy - a.xy) * u,
                yx=a.yx + (b.yx - a.yx) * u,
                yy=a.yy + (b.yy - a.yy) * u,
                tx=a.tx + (b.tx - a.tx) * u,
                ty=a.ty + (b.ty - a.ty) * u,
            )

        shift = Transform2D.translation(-1, 0)

        def document_at(t: float) -> VectorDocument:
            # Color changes are document paint changes; geometry and color remain
            # one dynamic vector value rather than 100 independently-updated glyphs.
            if t < 1:
                color_doc = white
            elif t < 2:
                color_doc = _recolor_vector(
                    base, _lerp_color(WHITE, YELLOW, smooth(t - 1))
                )
            elif t < 3:
                return shifted_yellow
            elif t < 4:
                color_doc = _recolor_vector(
                    base, _lerp_color(YELLOW, BLUE, smooth(t - 3))
                )
            else:
                color_doc = blue

            if t < 1:
                return map_vector_document(
                    color_doc, Transform2D.translation(-smooth(t), 0).apply
                )
            if t < 5:
                return map_vector_document(color_doc, shift.apply)
            if t < 6:
                transform = affine_between(shift, fit, smooth(t - 5))
                return map_vector_document(color_doc, transform.apply)
            if t < 7:
                return fitted_blue
            if t < 12:
                u = smooth((t - 7) / 5)
                return map_vector_document(
                    fitted_blue,
                    lambda p: lerp_point(p, exp_point(p), u),
                )
            if t < 13:
                return exp_blue
            if t < 18:
                u = smooth((t - 13) / 5)
                return map_vector_document(
                    exp_blue,
                    lambda p: lerp_point(p, wave_point(p), u),
                )
            return final_blue

        grid = DynamicVectorObject2D(document_at)
        sc.add(grid)
        sc.wait(19)


class NumberPlaneExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60

        blue_d = Color(35, 107, 142)
        faded = blue_d.with_alpha(128)
        lines = []

        for x in range(-7, 8):
            if x:
                lines.append(
                    Line((x, -4), (x, 4), stroke=blue_d, stroke_width=2 / 90, trim=0)
                )
        for i in range(-13, 14, 2):
            x = i / 2
            lines.append(
                Line((x, -4), (x, 4), stroke=faded, stroke_width=1 / 90, trim=0)
            )
        for y in range(-4, 5):
            if y:
                lines.append(
                    Line((-7, y), (7, y), stroke=blue_d, stroke_width=2 / 90, trim=0)
                )
        for i in range(-7, 8, 2):
            y = i / 2
            lines.append(
                Line((-7, y), (7, y), stroke=faded, stroke_width=1 / 90, trim=0)
            )
        lines.extend(
            [
                Line((-7, 0), (7, 0), stroke=WHITE, stroke_width=2 / 90, trim=0),
                Line((0, -4), (0, 4), stroke=WHITE, stroke_width=2 / 90, trim=0),
            ]
        )

        self.lines = lines
        self.plane = Group(lines)

        xs = [(-7 + 14 * i / 319) for i in range(320)]
        self.graph = Polyline(
            [(x, math.sin(x)) for x in xs], stroke=BLUE, stroke_width=4 / 90, trim=0
        )

    def construct(self) -> None:
        *lines, graph = self.add(*self.lines, self.graph)
        self.wait(0.2)

        stagger = (2 - 1.32) / (len(lines) - 1)
        with self.parallel():
            for i, line in enumerate(lines):
                line.create(duration=1.32, at=i * stagger)

        graph.create()
        self.wait()

        with self.parallel(duration=2):
            for line in lines:
                line.transform_function(
                    lambda a: Transform2D(1 + 2 * a, -a, a, 1 + a, 0, 0),
                    easing=Easing.SMOOTH,
                )
            graph.transform_function(
                lambda a: Transform2D(1 + 2 * a, -a, a, 1 + a, 0, 0),
                easing=Easing.SMOOTH,
            )

        self.wait()


class UpdaterExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60

        def width_at(t: float) -> float:
            if t < 1:
                return 2.0
            if t < 2:
                a = t - 1
                return 2 * (1 + a)
            if t < 3:
                a = t - 2
                return 4 * (1 - 0.5 * a)
            if t < 4:
                a = t - 3
                return 2 + 3 * a
            if t < 9:
                a = (t - 4) / 5
                return 5 + 2.5 * math.sin(a * 5)
            return 5.0

        self.width_at = width_at

    def construct(self) -> None:
        sc = self
        width_at = self.width_at

        def sq_geom(t):
            return RectangleGeometry(max(0.05, width_at(t)), 2.0)

        square = DynamicGeometryObject2D(sq_geom, fill=BLUE_E, stroke=None, z_index=0)

        def brace_geom(t):
            w = width_at(t)
            y = 1.35
            h = 0.22
            return PolylineGeometry(
                (
                    Vec2(-w / 2, y - h),
                    Vec2(-w / 2, y),
                    Vec2(-0.12, y),
                    Vec2(0, y + h),
                    Vec2(0.12, y),
                    Vec2(w / 2, y),
                    Vec2(w / 2, y - h),
                )
            )

        brace = DynamicGeometryObject2D(
            brace_geom, stroke=WHITE, stroke_width=0.03, z_index=1
        )
        prefix = Text("Width =", font_size=25, position=(-0.55, 2.05))
        number = DynamicNumber(
            width_at,
            number_format=NumberFormat(width=5, decimals=2, sign="space"),
            font_size=25,
            position=(0.55, 2.05),
        )
        sc.add(square, brace, prefix, number)
        # Timeline length/phase boundaries are encoded in width_at.
        sc.wait(1)
        sc.wait(1)
        sc.wait(1)
        sc.wait(1)
        sc.wait(5)
        sc.wait(1)


class ArrowPointingExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.p1 = Vec2(-3, 0)
        self.dot1 = Circle(0.08, position=self.p1, fill=WHITE)
        self.dot2 = Circle(0.08, fill=WHITE)

    def construct(self) -> None:
        sc = self
        p1 = self.p1

        def p2(t):
            a = TAU * max(0, min(1, t / 4))
            return Vec2(2 - 2 * math.cos(a), -2 * math.sin(a))

        _dot1, dot2 = sc.add(self.dot1, self.dot2)
        dot2.transform_function(
            lambda a: affine2d(
                position=(2 - 2 * math.cos(TAU * a), -2 * math.sin(TAU * a))
            ),
            duration=4,
            easing=Easing.LINEAR,
        )

        def arrow_poly(t):
            a = p1
            b = p2(t)
            dx, dy = b.x - a.x, b.y - a.y
            L = max(1e-6, math.hypot(dx, dy))
            ux, uy = dx / L, dy / L
            nx, ny = -uy, ux
            tip = min(0.22, L * 0.25)
            shaft = 0.025
            half = 0.075
            bx, by = b.x - ux * tip, b.y - uy * tip
            return PolygonGeometry(
                (
                    Vec2(a.x + nx * shaft, a.y + ny * shaft),
                    Vec2(bx + nx * shaft, by + ny * shaft),
                    Vec2(bx + nx * half, by + ny * half),
                    b,
                    Vec2(bx - nx * half, by - ny * half),
                    Vec2(bx - nx * shaft, by - ny * shaft),
                    Vec2(a.x - nx * shaft, a.y - ny * shaft),
                )
            )

        arrow = DynamicGeometryObject2D(arrow_poly, fill=YELLOW, stroke=None, z_index=2)
        sc.add(arrow)


class CombineUpdatersExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        self.left = -6.0
        self.right = 6.0

    def construct(self) -> None:
        sc = self
        left, right = self.left, self.right

        def state(t):
            segment = min(2, int(max(0, t) // 2))
            a = (t - segment * 2) / 2 if t < 6 else 1
            x = left + (right - left) * max(0, min(1, a))
            y = 0
            rot = 0
            if segment >= 1:
                y = math.sin(max(0, min(1, a)) * 4 * PI)
            if segment >= 2:
                rot = -TAU * max(0, min(1, a))
            return Transform2D.translation(x, y).rotate(rot)

        obj = DynamicGeometryObject2D(
            lambda t: square_polygon(2.0, state(t)), stroke=WHITE, stroke_width=0.04
        )
        obj = sc.add(obj)
        sc.wait(2)
        sc.wait(2)
        obj.style(stroke=BLUE, stroke_width=0.04, duration=2, easing=Easing.LINEAR)


class RotatingPieExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60
        sectors = []
        for i, color in enumerate((RED, PURPLE, MAROON, GOLD)):
            angle = i * TAU / 4
            offset = Vec2(
                0.05 * math.cos(angle + PI / 4),
                0.05 * math.sin(angle + PI / 4),
            )
            sectors.append(
                Object2D(
                    sector_polygon(angle, TAU / 4, 1.5), position=offset, fill=color
                )
            )
        self.pie = Group(sectors)
        self.sector0_origin = sectors[0].origin

    def construct(self) -> None:
        sc = self
        pie = sc.add(self.pie)
        sector0 = pie.children[0]
        base0 = self.sector0_origin
        with sc.parallel():
            pie.transform_function(
                lambda a: affine2d(rotation=TAU * a), duration=5, easing=Easing.LINEAR
            )
            sector0.transform_function(
                lambda a: affine2d(
                    position=(
                        base0.x + math.sin(PI * a) / math.sqrt(2),
                        base0.y + math.sin(PI * a) / math.sqrt(2),
                    )
                ),
                duration=2,
                easing=Easing.LINEAR,
                at=2,
            )


class MarkedItemExample(Scene):
    def setup(self) -> None:
        self.canvas = CANVAS
        self.fps = 60

        def tr(a):
            return Transform2D.translation(math.sin(4 * PI * a), 0).rotate(TAU * a)

        self.tr = tr
        self.square = Square(2, stroke=WHITE, stroke_width=0.04)
        self.local1 = Vec2(0.5, 0)
        self.local2 = Vec2(0, -0.5)

    def construct(self) -> None:
        sc = self
        tr = self.tr
        local1, local2 = self.local1, self.local2
        square = sc.add(self.square)
        square.transform_function(tr, duration=4, easing=Easing.LINEAR)

        def mark(local, t):
            return tr(max(0, min(1, t / 4))).apply(local)

        tri1 = DynamicGeometryObject2D(
            lambda t: triangle_polygon(mark(local1, t), 0.20),
            stroke=GREEN,
            stroke_width=0.035,
            z_index=2,
        )
        tri2 = DynamicGeometryObject2D(
            lambda t: triangle_polygon(mark(local2, t), 0.20),
            stroke=BLUE,
            stroke_width=0.035,
            z_index=2,
        )
        d1 = DynamicGeometryObject2D(
            lambda t: circle_polygon(mark(local1, t), 0.055, 16),
            fill=RED,
            stroke=None,
            z_index=3,
        )
        d2 = DynamicGeometryObject2D(
            lambda t: circle_polygon(mark(local2, t), 0.055, 16),
            fill=RED,
            stroke=None,
            z_index=3,
        )
        sc.add(tri1, tri2, d1, d2)


SCENES: dict[str, type[Scene]] = {
    "HelloJAnimExample": HelloJAnimExample,
    "BasicAnimationExample": BasicAnimationExample,
    "TextExample": TextExample,
    "TypstExample": TypstExample,
    "TypstColorizeExample": TypstColorizeExample,
    "AnimatingPiExample": AnimatingPiExample,
    "NumberPlaneExample": NumberPlaneExample,
    "UpdaterExample": UpdaterExample,
    "ArrowPointingExample": ArrowPointingExample,
    "CombineUpdatersExample": CombineUpdatersExample,
    "RotatingPieExample": RotatingPieExample,
    "MarkedItemExample": MarkedItemExample,
    "FrameEffectExample": FrameEffectExample,
    "MaskExample": MaskExample,
    "ThreeDShapesExample": ThreeDShapesExample,
}


WORKER_HINTS = {
    # Nonlinear VectorDocument construction is Python-heavy; extra workers only
    # contend on the GIL. Offscreen compositing benefits from a few workers but
    # has a larger per-frame RGBA working set.
    "AnimatingPiExample": 2,
    "FrameEffectExample": 4,
    "MaskExample": 4,
}


def render_one(name: str, *, workers: int | None = None):
    sc = SCENES[name]()
    sc._run_authoring_hooks()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{name}.mp4"
    resolved_workers = workers if workers is not None else WORKER_HINTS.get(name, 8)
    sc.render(
        out,
        fps=30,
        workers=resolved_workers,
        verify_random_access=True,
        preset="veryfast",
    )
    print(f"{name}: duration={sc.duration:.2f}s workers={resolved_workers} -> {out}")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("example", nargs="?", choices=[*SCENES, "all"], default="all")
    ap.add_argument("--workers", type=int, default=None)
    args = ap.parse_args()
    names = SCENES if args.example == "all" else [args.example]
    for name in names:
        render_one(name, workers=args.workers)


if __name__ == "__main__":
    main()
