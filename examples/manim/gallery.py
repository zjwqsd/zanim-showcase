"""Zanim ports of Manim Community v0.21.0 Example Gallery.

Zanim style is kept intentionally: setup() owns object construction and layout;
construct() only authors lifetime and timeline behavior.
"""

from __future__ import annotations
from math import cos, sin, pi
from pathlib import Path

from zanim import *

CANVAS = Canvas(1280, 720, 90)
MANIM_ASSETS = Path(__file__).resolve().parents[2] / "public" / "assets" / "manim"


def dot(x, y, color=WHITE, radius=0.09):
    return Circle(radius, position=(x, y), fill=color, stroke=None)


def path(points, color=CYAN, width=0.03, trim=1.0):
    return Polyline(
        tuple(Vec2(*p) for p in points), stroke=color, stroke_width=width, trim=trim
    )


def Rotating(obj, *, about_point, run_time=1.0):
    """Manim-gallery compatibility helper; not part of Zanim's public API."""
    return obj.rotate(
        by=TAU,
        about=about_point,
        duration=run_time,
        easing=Easing.LINEAR,
    )


class ManimCELogo(Scene):
    def setup(self):
        self.canvas = Canvas(1280, 720, 90)
        self.background = Rectangle(
            self.canvas.width / self.canvas.unit_size,
            self.canvas.height / self.canvas.unit_size,
            fill=Color(236, 230, 226),
            stroke=None,
            z_index=-100,
        )
        logo_green = Color(135, 194, 165)
        logo_blue = Color(82, 88, 147)
        logo_red = Color(224, 122, 95)
        logo_black = Color(52, 52, 52)

        ds_m = Math(
            "bb(M)",
            font_size=250,
            color=logo_black,
            position=(-2.25, 1.5),
            scale=(1, 1.04),
        )
        circle = Circle(1, fill=logo_green, stroke=logo_green)
        circle.move(by=(-1, 0), frame=PARENT)
        square = Square(2, fill=logo_blue, stroke=logo_blue)
        square.move(by=(0, 1), frame=PARENT)
        triangle = RegularPolygon(3, 1, fill=logo_red, stroke=logo_red)
        triangle.move(by=(1, 0), frame=PARENT)

        self.logo = Group([triangle, square, circle, ds_m])
        self.logo.move(by=(-self.logo.center.x, -self.logo.center.y), frame=PARENT)

    def construct(self):
        self.add(self.background, self.logo)


class BraceAnnotation(Scene):
    def setup(self):
        self.canvas = CANVAS
        a, b = Vec2(-2, -1), Vec2(2, 1)
        self.line = Line(a, b, stroke=ORANGE)

        line_direction = (b - a).normalized()
        normal = Vec2(-line_direction.y, line_direction.x)
        self.lower = Brace(self.line)
        self.upper = Brace(self.line, direction=normal)

        lower_label = self.lower.label_point()
        upper_label = self.upper.label_point()
        self.label = Math(
            '"Horizontal distance"',
            position=(lower_label.x, lower_label.y),
        )
        self.tex = Math("x - x_1", position=(upper_label.x, upper_label.y))
        self.dot1 = Dot(a)
        self.dot2 = Dot(b)

    def construct(self):
        self.add(
            self.line,
            self.dot1,
            self.dot2,
            self.lower,
            self.upper,
            self.label,
            self.tex,
        )


class VectorArrow(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.plane = NumberPlane()
        self.origin = Dot(ORIGIN)
        self.arrow = Arrow(ORIGIN, (2, 2), buff=0)
        self.origin_text = Text("(0, 0)").next_to(self.origin, DOWN)
        self.tip_text = Text("(2, 2)").next_to(self.arrow.end, RIGHT)

    def construct(self):
        self.add(self.plane, self.origin, self.arrow, self.origin_text, self.tip_text)


class GradientImageFromArray(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.image = Image(MANIM_ASSETS / "gradient.png", width=4)
        self.border = SurroundingRectangle(self.image, color=GREEN)

    def construct(self):
        self.add(self.image, self.border)


class BooleanOperations(Scene):
    def setup(self):
        self.canvas = CANVAS

        manim_blue = Color(88, 196, 221)
        manim_red = Color(252, 98, 85)
        manim_green = Color(131, 193, 103)
        manim_orange = Color(255, 134, 47)
        manim_yellow = Color(247, 217, 111)
        manim_pink = Color(209, 71, 189)

        self.ellipse1 = Ellipse(
            2,
            2.5,
            position=(-4, 0),
            fill=manim_blue.with_alpha(128),
            stroke=manim_blue,
            stroke_width=10 / 90,
            opacity=0,
        )
        self.ellipse2 = Ellipse(
            2,
            2.5,
            position=(-2, 0),
            fill=manim_red.with_alpha(128),
            stroke=manim_red,
            stroke_width=10 / 90,
            opacity=0,
        )

        self.title = Text(
            "Boolean Operation",
            font_size=34,
            opacity=0,
            position=(-3, 3.15),
        )
        title_bounds = self.title.bounds()
        self.underline = Line(
            (title_bounds.left, title_bounds.bottom - 0.05),
            (title_bounds.right, title_bounds.bottom - 0.05),
            stroke=WHITE,
            opacity=0,
        )

        self.intersection = Intersection(
            self.ellipse1, self.ellipse2, color=manim_green, fill_opacity=0.5
        )
        self.union = Union(
            self.ellipse1, self.ellipse2, color=manim_orange, fill_opacity=0.5
        )
        self.exclusion = Exclusion(
            self.ellipse1, self.ellipse2, color=manim_yellow, fill_opacity=0.5
        )
        self.difference = Difference(
            self.ellipse1, self.ellipse2, color=manim_pink, fill_opacity=0.5
        )

        self.intersection_text = Text(
            "Intersection",
            font_size=23,
            opacity=0,
            position=(5, 3.43),
        )
        self.union_text = Text("Union", font_size=23, opacity=0, position=(5, 1.29))
        self.exclusion_text = Text(
            "Exclusion",
            font_size=23,
            opacity=0,
            position=(5, -1.11),
        )
        self.difference_text = Text(
            "Difference",
            font_size=23,
            opacity=0,
            position=(2.5, 1.29),
        )

    def construct(self):
        ellipse1, ellipse2, title, underline = self.add(
            self.ellipse1, self.ellipse2, self.title, self.underline
        )
        with self.parallel(duration=1):
            ellipse1.fade_in()
            ellipse2.fade_in()
            title.fade_in()
            underline.fade_in()

        intersection = self.add(self.intersection)
        intersection.affine(position=(5, 2.5), scale=0.25, duration=1)
        intersection_text = self.add(self.intersection_text)
        intersection_text.fade_in(duration=1)

        union = self.add(self.union)
        union.affine(position=(5, 0.15), scale=0.30, duration=1)
        union_text = self.add(self.union_text)
        union_text.fade_in(duration=1)

        exclusion = self.add(self.exclusion)
        exclusion.affine(position=(5, -2.25), scale=0.30, duration=1)
        exclusion_text = self.add(self.exclusion_text)
        exclusion_text.fade_in(duration=1)

        difference = self.add(self.difference)
        difference.affine(position=(2.5, 0.15), scale=0.30, duration=1)
        difference_text = self.add(self.difference_text)
        difference_text.fade_in(duration=1)


class PointMovingOnShapes(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.circle = Circle(1, stroke=BLUE, scale=0)
        self.dot = Dot()
        self.line = Line((3, 0), (5, 0))

    def construct(self):
        dot, line, circle = self.add(self.dot, self.line, self.circle)

        circle.affine(position=(0, 0), scale=1, duration=1, easing=Easing.SMOOTH)
        dot.move(by=RIGHT, frame=WORLD, duration=1, easing=Easing.SMOOTH)
        dot.move_along(circle, duration=2, easing=Easing.LINEAR)
        Rotating(dot, about_point=(2, 0), run_time=1.5)
        self.wait()


class MovingAround(Scene):
    def setup(self):
        self.canvas = CANVAS
        blue = Color(88, 196, 221)
        self.orange = Color(255, 134, 47)
        self.square = Square(2, fill=blue, stroke=blue)

    def construct(self):
        square = self.add(self.square)
        square.move(by=(-1, 0), frame=WORLD)
        square.style(fill=self.orange, stroke=Color(88, 196, 221))
        square.scale(by=0.3, frame=WORLD)
        square.rotate(by=0.4, frame=WORLD)


class MovingAngle(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.center = Vec2(-1, 0)
        self.theta_value = ScalarValue(110 * pi / 180)

        def ray_geometry(time):
            angle = self.theta_value.value_at(time)
            return Line(
                self.center,
                (
                    self.center.x + 2 * cos(angle),
                    self.center.y + 2 * sin(angle),
                ),
            ).geometry

        def arc_geometry(time):
            angle = self.theta_value.value_at(time)
            return Arc(0.5, 0, angle).geometry

        self.base = Line((-1, 0), (1, 0), stroke=WHITE)
        self.ray = DynamicGeometryObject2D(ray_geometry, stroke=WHITE)
        self.arc = DynamicGeometryObject2D(
            arc_geometry,
            stroke=WHITE,
            position=(self.center.x, self.center.y),
        )

        initial = 110 * pi / 180
        q = initial * 0.5
        self.theta = Math(
            "theta",
            position=(
                self.center.x + 0.8 * cos(q),
                self.center.y + 0.8 * sin(q),
            ),
        )
        self.theta_red = Math("theta", color=RED)

    def _theta_transform(self, start_angle, end_angle):
        def provider(alpha):
            angle = start_angle + (end_angle - start_angle) * alpha
            q = angle * 0.5
            return affine2d(
                position=(
                    self.center.x + 0.8 * cos(q),
                    self.center.y + 0.8 * sin(q),
                )
            )

        return provider

    def construct(self):
        tracker = self.add(self.theta_value)
        ray, arc, theta = self.add(self.ray, self.arc, self.theta)
        self.add(self.base)

        self.wait()

        with self.parallel(duration=1):
            tracker.value(to=40 * pi / 180)
            theta.transform_function(
                self._theta_transform(110 * pi / 180, 40 * pi / 180)
            )

        with self.parallel(duration=1):
            tracker.value(to=180 * pi / 180)
            theta.transform_function(
                self._theta_transform(40 * pi / 180, 180 * pi / 180)
            )

        theta.morph(to=self.theta_red, duration=0.5)

        with self.parallel(duration=1):
            tracker.value(to=350 * pi / 180)
            theta.transform_function(
                self._theta_transform(180 * pi / 180, 350 * pi / 180)
            )


class MovingDots(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.d1 = dot(0, 0, BLUE, 0.08)
        self.d2 = dot(0.58, 0, GREEN, 0.08)
        self.line = Line((0, 0), (0.58, 0), stroke=RED)

    def construct(self):
        d1, d2, line = self.add(self.d1, self.d2, self.line)
        d1.move(by=(5, 0), frame=WORLD)
        d2.move(by=(0, 4), frame=WORLD)
        self.wait()


class MovingGroupToDestination(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.group = Group([dot(-1.4, 0), dot(0, 0), dot(1.4, 0, RED), dot(2.8, 0)])
        self.dest = dot(4, 3, YELLOW)

    def construct(self):
        group = self.add(self.group)
        self.add(self.dest)
        group.move(by=(2.6, 3), frame=WORLD)
        self.wait(0.5)


class MovingFrameBox(Scene):
    def setup(self):
        self.canvas = CANVAS

        self.left = Math("(d)/(d x) f(x) g(x) =", font_size=38, reveal=0)
        self.mid = Math("f(x) (d)/(d x) g(x)", font_size=38, reveal=0)
        self.plus = Math("+", font_size=38, reveal=0)
        self.right = Math("g(x) (d)/(d x) f(x)", font_size=38, reveal=0)

        Row(gap=0.04, at=(0, 0)).place(self.left, self.mid, self.plus, self.right)

        self.framebox1 = SurroundingRectangle(self.mid, buff=0.1, trim=0)
        self.framebox2 = SurroundingRectangle(self.right, buff=0.1)

    def construct(self):
        left, mid, plus, right = self.add(self.left, self.mid, self.plus, self.right)
        with self.parallel(duration=1):
            left.create()
            mid.create()
            plus.create()
            right.create()

        framebox1 = self.add(self.framebox1)
        framebox1.create(duration=1)
        self.wait()

        self.replace(framebox1, self.framebox2, duration=1)
        self.wait()


class RotationUpdater(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.reference = Line((0, 0), (-1, 0), stroke=WHITE)
        self.moving = Line((0, 0), (-1, 0), stroke=YELLOW)

    def construct(self):
        moving = self.add(self.moving)
        self.add(self.reference)
        moving.rotate(by=2, about=(0, 0), duration=2, easing=Easing.LINEAR)
        moving.rotate(by=-2, about=(0, 0), duration=2, easing=Easing.LINEAR)
        self.wait(0.5)


class PointWithTrace(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.dot = dot(0, 0, WHITE, 0.08)

    def construct(self):
        dot_obj = self.add(self.dot)
        dot_obj.rotate(by=PI, about=(1, 0), duration=2)
        self.wait()
        dot_obj.move(by=(0, 1), frame=WORLD)
        dot_obj.move(by=(-1, 0), frame=WORLD)
        self.wait()


class SinAndCosFunctionPlot(Scene):
    def setup(self):
        self.canvas = CANVAS
        blue = Color(88, 196, 221)
        red = Color(252, 98, 85)
        green = Color(131, 193, 103)
        yellow = Color(247, 217, 111)

        self.axes_model = Axes((-10, 10.3), (-1.5, 1.5), width=10, height=6)

        axis_parts = [
            Line(
                self.axes_model.c2p(-10, 0),
                self.axes_model.c2p(10.3, 0),
                stroke=green,
                stroke_width=0.026,
            ),
            Line(
                self.axes_model.c2p(0, -1.5),
                self.axes_model.c2p(0, 1.5),
                stroke=green,
                stroke_width=0.026,
            ),
        ]
        for x in range(-10, 11):
            q = self.axes_model.c2p(x, 0)
            size = 0.13 if x % 2 == 0 else 0.07
            axis_parts.append(
                Line(
                    (q.x, q.y - size),
                    (q.x, q.y + size),
                    stroke=green,
                    stroke_width=0.022,
                )
            )
        for y in (-1, 0, 1):
            q = self.axes_model.c2p(0, y)
            axis_parts.append(
                Line(
                    (q.x - 0.07, q.y),
                    (q.x + 0.07, q.y),
                    stroke=green,
                    stroke_width=0.022,
                )
            )
        self.axes = Group(axis_parts)

        self.sin_curve = self.axes_model.plot(sin, x_range=(-10, 10.3), color=blue)
        self.cos_curve = self.axes_model.plot(cos, x_range=(-10, 10.3), color=red)

        tau_point = self.axes_model.c2p(TAU, cos(TAU))
        tau_base = self.axes_model.c2p(TAU, 0)
        self.tau_line = Line(tau_base, tau_point, stroke=yellow, stroke_width=0.03)

        labels = []
        for x in range(-10, 11, 2):
            if x == 0:
                continue
            q = self.axes_model.c2p(x, 0)
            labels.append(Math(str(x), font_size=24, position=(q.x, q.y - 0.38)))

        x_end = self.axes_model.c2p(10.3, 0)
        y_end = self.axes_model.c2p(0, 1.5)
        sin_point = self.axes_model.c2p(-10, sin(-10))
        cos_point = self.axes_model.c2p(10.3, cos(10.3))
        labels.extend(
            [
                Math(
                    "x",
                    font_size=32,
                    position=(x_end.x + 0.42, x_end.y + 0.42),
                ),
                Math(
                    "y",
                    font_size=32,
                    position=(y_end.x + 0.32, y_end.y + 0.25),
                ),
                Math(
                    "sin(x)",
                    font_size=38,
                    color=blue,
                    position=(sin_point.x, sin_point.y + 0.42),
                ),
                Math(
                    "cos(x)",
                    font_size=38,
                    color=red,
                    position=(cos_point.x + 1.05, cos_point.y),
                ),
                Math(
                    "x = 2 pi",
                    font_size=34,
                    position=(tau_point.x + 1.05, tau_point.y + 0.40),
                ),
            ]
        )
        self.labels = Group(labels)

    def construct(self):
        self.add(self.axes, self.sin_curve, self.cos_curve, self.tau_line, self.labels)


class ArgMinExample(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.ax = Axes((0, 10), (0, 100), width=12, height=6)
        self.tracker = ScalarValue(0)
        self.maroon = Color(197, 95, 115)

        def func(x):
            return 2 * (x - 5) ** 2

        self.func = func
        self.graph = self.ax.plot(func, x_range=(0, 10), color=self.maroon)

        axis_parts = [
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(10, 0), stroke=WHITE, stroke_width=0.026
            ),
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(0, 100), stroke=WHITE, stroke_width=0.026
            ),
        ]
        for x in range(11):
            q = self.ax.c2p(x, 0)
            axis_parts.append(
                Line(
                    (q.x, q.y - 0.07),
                    (q.x, q.y + 0.07),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        for y in range(0, 101, 10):
            q = self.ax.c2p(0, y)
            axis_parts.append(
                Line(
                    (q.x - 0.07, q.y),
                    (q.x + 0.07, q.y),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        self.axes = Group(axis_parts)

        x_end = self.ax.c2p(10, 0)
        y_end = self.ax.c2p(0, 100)
        self.labels = Group(
            [
                Math(
                    "x",
                    font_size=32,
                    position=(x_end.x + 0.32, x_end.y + 0.18),
                ),
                Math(
                    "f(x)",
                    font_size=32,
                    position=(y_end.x + 0.45, y_end.y + 0.28),
                ),
            ]
        )

        def dot_geometry(time):
            x = self.tracker.value_at(time)
            p = self.ax.c2p(x, func(x))
            r = 0.08
            return Polygon(
                [
                    (p.x + r * cos(TAU * i / 24), p.y + r * sin(TAU * i / 24))
                    for i in range(24)
                ]
            ).geometry

        self.dot = DynamicGeometryObject2D(
            dot_geometry, fill=WHITE, stroke=None, z_index=10
        )

    def construct(self):
        tracker = self.add(self.tracker)
        self.add(self.axes, self.labels, self.graph, self.dot)
        tracker.value(to=5, duration=1, easing=Easing.SMOOTH)
        self.wait()


class GraphAreaPlot(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.ax = Axes((0, 5), (0, 6), width=12, height=6)
        blue_c = Color(88, 196, 221)
        green_b = Color(166, 207, 140)
        yellow = Color(255, 255, 0)

        def f1(x):
            return 4 * x - x * x

        def f2(x):
            return 0.8 * x * x - 3 * x + 4

        axis_parts = [
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(5, 0), stroke=WHITE, stroke_width=0.026
            ),
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(0, 6), stroke=WHITE, stroke_width=0.026
            ),
        ]
        for x in range(6):
            q = self.ax.c2p(x, 0)
            axis_parts.append(
                Line(
                    (q.x, q.y - 0.07),
                    (q.x, q.y + 0.07),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        for y in range(7):
            q = self.ax.c2p(0, y)
            axis_parts.append(
                Line(
                    (q.x - 0.07, q.y),
                    (q.x + 0.07, q.y),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        self.axes = Group(axis_parts)

        self.curve1 = self.ax.plot(f1, x_range=(0, 4), color=blue_c)
        self.curve2 = self.ax.plot(f2, x_range=(0, 4), color=green_b)
        self.lines = Group(
            [
                Line(
                    self.ax.c2p(2, 0),
                    self.ax.c2p(2, f1(2)),
                    stroke=yellow,
                    stroke_width=0.03,
                ),
                Line(
                    self.ax.c2p(3, 0),
                    self.ax.c2p(3, f1(3)),
                    stroke=yellow,
                    stroke_width=0.03,
                ),
            ]
        )

        rects = []
        dx = 0.03
        x = 0.3
        while x < 0.6 - 1e-9:
            a = self.ax.c2p(x, 0)
            b = self.ax.c2p(x + dx, f1(x))
            rects.append(
                Rectangle(
                    abs(b.x - a.x),
                    abs(b.y - a.y),
                    position=((a.x + b.x) / 2, (a.y + b.y) / 2),
                    fill=blue_c.with_alpha(128),
                    stroke=blue_c,
                    stroke_width=0.008,
                )
            )
            x += dx
        self.riemann = Group(rects)

        top = [self.ax.c2p(2 + i / 80, f1(2 + i / 80)) for i in range(81)]
        bottom = [self.ax.c2p(3 - i / 80, f2(3 - i / 80)) for i in range(81)]
        self.area = Polygon(
            [(p.x, p.y) for p in top + bottom],
            fill=Color(136, 136, 136, 128),
            stroke=None,
            z_index=-1,
        )

        p2, p3 = self.ax.c2p(2, 0), self.ax.c2p(3, 0)
        x_end, y_end = self.ax.c2p(5, 0), self.ax.c2p(0, 6)
        self.labels = Group(
            [
                Math("2", font_size=24, position=(p2.x, p2.y - 0.38)),
                Math("3", font_size=24, position=(p3.x, p3.y - 0.38)),
                Math(
                    "x",
                    font_size=32,
                    position=(x_end.x + 0.34, x_end.y + 0.18),
                ),
                Math(
                    "y",
                    font_size=32,
                    position=(y_end.x + 0.28, y_end.y + 0.25),
                ),
            ]
        )

    def construct(self):
        self.add(
            self.axes,
            self.curve1,
            self.curve2,
            self.lines,
            self.riemann,
            self.area,
            self.labels,
        )


class PolygonOnAxes(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.ax = Axes((0, 10), (0, 10), width=6, height=6)
        self.tracker = ScalarValue(5)
        self.k = 25
        blue = Color(88, 196, 221)
        yellow_b = Color(255, 234, 148)
        yellow_d = Color(244, 211, 69)

        axis_parts = [
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(10, 0), stroke=WHITE, stroke_width=0.026
            ),
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(0, 10), stroke=WHITE, stroke_width=0.026
            ),
        ]
        for x in range(11):
            q = self.ax.c2p(x, 0)
            axis_parts.append(
                Line(
                    (q.x, q.y - 0.07),
                    (q.x, q.y + 0.07),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        for y in range(11):
            q = self.ax.c2p(0, y)
            axis_parts.append(
                Line(
                    (q.x - 0.07, q.y),
                    (q.x + 0.07, q.y),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        self.axes = Group(axis_parts)

        self.graph = self.ax.plot(
            lambda x: self.k / x,
            x_range=(self.k / 10, 10),
            samples=420,
            color=yellow_d,
        )

        def rect_geometry(time):
            x = self.tracker.value_at(time)
            y = self.k / x
            o = self.ax.c2p(0, 0)
            p = self.ax.c2p(x, y)
            return Polygon([(p.x, p.y), (o.x, p.y), (o.x, o.y), (p.x, o.y)]).geometry

        def dot_geometry(time):
            x = self.tracker.value_at(time)
            p = self.ax.c2p(x, self.k / x)
            r = 0.08
            return Polygon(
                [
                    (p.x + r * cos(TAU * i / 24), p.y + r * sin(TAU * i / 24))
                    for i in range(24)
                ]
            ).geometry

        self.polygon = DynamicGeometryObject2D(
            rect_geometry,
            fill=blue.with_alpha(128),
            stroke=yellow_b,
            stroke_width=1 / 90,
            opacity=0,
            z_index=-1,
        )
        self.dot = DynamicGeometryObject2D(
            dot_geometry, fill=WHITE, stroke=None, z_index=10
        )

    def construct(self):
        tracker = self.add(self.tracker)
        polygon = self.add(self.polygon)
        self.add(self.axes, self.graph, self.dot)
        polygon.fade_in(duration=1)
        tracker.value(to=10, duration=1, easing=Easing.SMOOTH)
        tracker.value(to=2.5, duration=1, easing=Easing.SMOOTH)
        tracker.value(to=5, duration=1, easing=Easing.SMOOTH)


class HeatDiagramPlot(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.ax = Axes((0, 40), (-8, 32), width=9, height=6)
        yellow = Color(255, 255, 0)

        axis_parts = [
            Line(
                self.ax.c2p(0, 0), self.ax.c2p(40, 0), stroke=WHITE, stroke_width=0.026
            ),
            Line(
                self.ax.c2p(0, -8), self.ax.c2p(0, 32), stroke=WHITE, stroke_width=0.026
            ),
        ]
        for x in range(0, 41, 5):
            q = self.ax.c2p(x, 0)
            axis_parts.append(
                Line(
                    (q.x, q.y - 0.07),
                    (q.x, q.y + 0.07),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        for y in range(-5, 31, 5):
            q = self.ax.c2p(0, y)
            axis_parts.append(
                Line(
                    (q.x - 0.07, q.y),
                    (q.x + 0.07, q.y),
                    stroke=WHITE,
                    stroke_width=0.022,
                )
            )
        self.axes = Group(axis_parts)

        values = [(0, 20), (8, 0), (38, 0), (39, -5)]
        points = [self.ax.c2p(x, y) for x, y in values]
        self.graph = Polyline([(p.x, p.y) for p in points], stroke=yellow)
        self.dots = Group([Dot((p.x, p.y), color=yellow) for p in points])

        labels = []
        for x in range(0, 40, 5):
            q = self.ax.c2p(x, 0)
            labels.append(Math(str(x), font_size=24, position=(q.x, q.y - 0.38)))
        for y in range(-5, 31, 5):
            q = self.ax.c2p(0, y)
            labels.append(Math(str(y), font_size=24, position=(q.x - 0.42, q.y)))
        x_end, y_end = self.ax.c2p(40, 0), self.ax.c2p(0, 32)
        labels.extend(
            [
                Math(
                    "Delta Q",
                    font_size=32,
                    position=(x_end.x + 0.55, x_end.y + 0.18),
                ),
                Math(
                    "T[degree C]",
                    font_size=32,
                    position=(y_end.x + 0.62, y_end.y + 0.25),
                ),
            ]
        )
        self.labels = Group(labels)

    def construct(self):
        self.add(self.axes, self.graph, self.dots, self.labels)


class FollowingGraphCamera(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.curve = path(
            [(-4.5 + i * 0.04, 1.2 * sin(i * 0.06)) for i in range(225)], BLUE, 0.04
        )
        self.point = dot(-4.5, 0, ORANGE, 0.12)

    def construct(self):
        point = self.add(self.point)
        self.add(self.curve)
        self.camera.affine(position=(-2.5, 0), scale=1.7, duration=1)
        with self.parallel(duration=4):
            point.move(by=(8.8, 0), frame=WORLD, easing=Easing.LINEAR)
            self.camera.affine(position=(2.5, 0), scale=1.7, easing=Easing.LINEAR)
        self.camera.affine(position=(0, 0), scale=1, duration=1)


class MovingZoomedSceneAround(Scene):
    def setup(self):
        self.canvas = CANVAS

        pixels = (
            (0, 100, 30, 200),
            (255, 0, 5, 33),
        )

        # Child scene sampled by the real secondary viewport.
        self.zoom_source = Scene(canvas=CANVAS)
        self.zoom_source.add(ArrayImage(pixels, height=7), Dot((-2, 2), color=WHITE))

        self.image = ArrayImage(pixels, height=7)
        self.dot = Dot((-2, 2), color=WHITE)

        self.source_frame = Rectangle(
            1.8,
            0.3,
            position=(-2, 2),
            fill=None,
            stroke=PURPLE,
            stroke_width=3 / 90,
            trim=0,
            z_index=30,
        )
        self.frame_text = Text(
            "Frame",
            color=PURPLE,
            font_size=34,
            opacity=0,
            position=(-2, 1.55),
            z_index=31,
        )

        def source_center(time):
            if time <= 7:
                return (-2, 2)
            if time >= 8:
                return (-2, -0.5)
            a = Easing.SMOOTH.apply(time - 7)
            return (-2, 2 - 2.5 * a)

        def source_size(time):
            if time <= 3:
                return (1.8, 0.3)
            if time >= 4:
                return (0.9, 0.45)
            a = Easing.SMOOTH.apply(time - 3)
            return (
                1.8 * (1 - 0.5 * a),
                0.3 * (1 + 0.5 * a),
            )

        self.viewport = SceneViewport(
            self.zoom_source,
            source_center=source_center,
            source_size=source_size,
            width=6,
            height=1,
            duration=12,
            position=(-2, 2),
            scale=0.3,
            z_index=10,
        )
        self.display_frame = Rectangle(
            6,
            1,
            fill=None,
            stroke=RED,
            stroke_width=6 / 90,
            position=(-2, 2),
            scale=0.3,
            z_index=20,
        )
        self.zoom_text = Text(
            "Zoomed camera",
            color=RED,
            font_size=34,
            opacity=0,
            position=(3.6, 1.15),
            z_index=31,
        )

    def construct(self):
        image, dot_obj, frame, frame_text = self.add(
            self.image, self.dot, self.source_frame, self.frame_text
        )

        # 0..1
        with self.parallel(duration=1):
            frame.create()
            frame_text.fade_in()

        # 1..2
        viewport, display_frame = self.add(self.viewport, self.display_frame)
        with self.parallel(duration=1):
            viewport.affine(position=(3.6, 2), scale=1)
            display_frame.affine(position=(3.6, 2), scale=1)

        # 2..3
        zoom_text = self.add(self.zoom_text)
        zoom_text.fade_in(duration=1)

        # 3..4
        with self.parallel(duration=1):
            frame.affine(position=(-2, 2), scale=(0.5, 1.5))
            viewport.affine(position=(3.6, 2), scale=(0.5, 1.5))
            display_frame.affine(position=(3.6, 2), scale=(0.5, 1.5))
            zoom_text.fade_out()
            frame_text.fade_out()

        # 4..5
        self.wait()

        # 5..6
        with self.parallel(duration=1):
            viewport.affine(position=(3.6, 2), scale=(1, 3))
            display_frame.affine(position=(3.6, 2), scale=(1, 3))

        # 6..7
        self.wait()

        # 7..8
        frame.move(by=(0, -2.5), frame=WORLD, duration=1, easing=Easing.SMOOTH)

        # 8..9
        self.wait()

        # 9..10
        with self.parallel(duration=1):
            viewport.affine(position=(-2, -0.5), scale=(0.15, 0.45))
            display_frame.affine(position=(-2, -0.5), scale=(0.15, 0.45))

        # 10..11
        with self.parallel(duration=1):
            display_frame.trim(to=0)
            frame.fade_out()
            viewport.fade_out()

        # 11..12
        self.wait()


class FixedInFrameMObjectTest(Scene):
    def __init__(self):
        phi = 75 * DEGREES
        theta = -45 * DEGREES
        radius = 8
        position = Vec3(
            radius * sin(phi) * cos(theta),
            radius * sin(phi) * sin(theta),
            radius * cos(phi),
        )
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(
                position=position,
                target=Vec3(),
                up=Vec3(0, 0, 1),
                fov_y_degrees=42,
            ),
        )

    def setup(self):
        white = Color(255, 255, 255)
        shaft = 0.018
        tick_length = 0.13
        tick_width = 0.012

        parts = [
            Box3D(Vec3(6.4, shaft, shaft), color=white),
            Box3D(
                Vec3(6.4, shaft, shaft),
                color=white,
                transform=Transform3D.rotation_z(PI / 2),
            ),
            Box3D(
                Vec3(7.0, shaft, shaft),
                color=white,
                transform=Transform3D.rotation_y(-PI / 2),
            ),
        ]

        for i in (-3, -2, -1, 1, 2, 3):
            parts.append(
                Box3D(
                    Vec3(tick_width, tick_length, tick_width),
                    color=white,
                    transform=Transform3D.translation(i, 0, 0),
                )
            )
            parts.append(
                Box3D(
                    Vec3(tick_length, tick_width, tick_width),
                    color=white,
                    transform=Transform3D.translation(0, i, 0),
                )
            )
        for i in (-2, -1, 1, 2):
            parts.append(
                Box3D(
                    Vec3(tick_length, tick_width, tick_width),
                    color=white,
                    transform=Transform3D.translation(0, 0, i),
                )
            )

        self.axes = Group3D(parts)
        self.label = Text(
            "This is a 3D text",
            font_size=48,
            position=(-4.35, 3.05),
            z_index=20,
        )

    def construct(self):
        self.add(self.axes, self.label)
        self.wait()


class ThreeDLightSourcePosition(Scene):
    def __init__(self):
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(position=Vec3(5, 4, 7), target=Vec3(), fov_y_degrees=34),
        )

    def setup(self):
        self.platform = Box3D(
            Vec3(2.2, 2.2, 0.25),
            color=BLUE,
            transform=Transform3D.translation(-1.3, 0, 0),
        )
        self.cube = Box3D(
            Vec3(2, 2, 2), color=GREEN, transform=Transform3D.translation(1.3, 0, 0.6)
        )

    def construct(self):
        self.add(self.platform, self.cube)


class ThreeDCameraRotation(Scene):
    def __init__(self):
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(
                position=Vec3(5.5, 4.5, 7.5), target=Vec3(), fov_y_degrees=34
            ),
        )

    def setup(self):
        self.cube = Box3D(Vec3(2.2, 2.2, 2.2), color=BLUE)

    def construct(self):
        cube = self.add(self.cube)
        cube.transform_function(
            lambda a: (
                Transform3D.rotation_z(TAU * a) @ Transform3D.rotation_y(TAU * 0.7 * a)
            ),
            duration=6,
            easing=Easing.LINEAR,
        )


class ThreeDCameraIllusionRotation(Scene):
    def __init__(self):
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(
                position=Vec3(5.5, 4.2, 7.5), target=Vec3(), fov_y_degrees=34
            ),
        )

    def setup(self):
        self.bars = (
            Box3D(Vec3(3.4, 0.18, 0.18), color=RED),
            Box3D(Vec3(0.18, 3.4, 0.18), color=GREEN),
            Box3D(Vec3(0.18, 0.18, 3.4), color=BLUE),
        )

    def construct(self):
        bars = self.add(*self.bars)
        with self.parallel(duration=6):
            for bar in bars:
                bar.transform_function(
                    lambda a: Transform3D.rotation_z(TAU * a), easing=Easing.LINEAR
                )


class ThreeDSurfacePlot(Scene):
    def __init__(self):
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(
                position=Vec3(6.5, 5.2, 8.5), target=Vec3(), fov_y_degrees=34
            ),
        )

    def setup(self):
        self.tiles = []
        for ix in range(-5, 6):
            for iy in range(-5, 6):
                x, y = ix * 0.42, iy * 0.42
                z = 0.75 * cos(x * 1.4) * cos(y * 1.4)
                self.tiles.append(
                    Box3D(
                        Vec3(0.36, 0.36, 0.08),
                        color=BLUE if z > 0 else PURPLE,
                        transform=Transform3D.translation(x, y, z),
                    )
                )

    def construct(self):
        self.add(*self.tiles)


class OpeningManim(Scene):
    def setup(self):
        self.canvas = CANVAS

        self.title = Text("This is some LaTeX", font_size=46, reveal=0)
        self.title.move(to=(0, 0.65))
        self.basel = Math("sum_(n=1)^infinity 1/n^2 = pi^2/6", font_size=48, opacity=0)
        self.basel.move(to=(0, -0.85))

        self.transform_title = Text("That was a transform", font_size=48)
        self.transform_title.move(to=(-4.25, 3.08))

        self.grid_title = Text("This is a grid", font_size=72, opacity=0)
        self.grid_title.move(to=(-4.35, 3.08))

        self.grid_transform_title = Text(
            "That was a non-linear function\napplied to the grid", font_size=48
        )
        self.grid_transform_title.move(to=(-3.45, 2.75))

        self.grid_reveal = ScalarValue(0)
        self.grid_deform = ScalarValue(0)

        blue_d = Color(35, 107, 142)
        faded = blue_d.with_alpha(128)
        paths = []

        def vertical(x, color, width):
            points = tuple(Vec2(x, -4.05 + 8.10 * i / 81) for i in range(82))
            paths.append((points, color, width))

        def horizontal(y, color, width):
            points = tuple(Vec2(-7.2 + 14.4 * i / 145, y) for i in range(146))
            paths.append((points, color, width))

        for x in range(-7, 8):
            if x != 0:
                vertical(x, blue_d, 2 / 90)
        for i in range(-13, 14, 2):
            vertical(i / 2, faded, 1 / 90)
        for y in range(-4, 5):
            if y != 0:
                horizontal(y, blue_d, 2 / 90)
        for i in range(-7, 8, 2):
            horizontal(i / 2, faded, 1 / 90)
        horizontal(0, WHITE, 2 / 90)
        vertical(0, WHITE, 2 / 90)

        self._grid_paths = tuple(paths)
        lag = 0.1
        count = len(self._grid_paths)
        total = 1 + lag * (count - 1)

        self.grid_lines = []
        for path_index, (points, color, width) in enumerate(self._grid_paths):

            def geometry_at(time, *, points=points, path_index=path_index):
                reveal = self.grid_reveal.value_at(time)
                deform = self.grid_deform.value_at(time)
                local = max(0.0, min(1.0, reveal * total - lag * path_index))

                transformed = []
                for point in points:
                    tx = point.x + sin(point.y)
                    ty = point.y + sin(point.x)
                    transformed.append(
                        Vec2(
                            point.x + (tx - point.x) * deform,
                            point.y + (ty - point.y) * deform,
                        )
                    )

                if local <= 1e-9:
                    p0 = transformed[0]
                    return Polyline((p0, p0)).geometry

                segment_count = len(transformed) - 1
                visible = local * segment_count
                whole = min(segment_count, int(visible))
                fraction = max(0.0, min(1.0, visible - whole))

                visible_points = transformed[: whole + 1]
                if whole < segment_count and fraction > 1e-9:
                    a = transformed[whole]
                    b = transformed[whole + 1]
                    visible_points.append(
                        Vec2(a.x + (b.x - a.x) * fraction, a.y + (b.y - a.y) * fraction)
                    )
                if len(visible_points) == 1:
                    visible_points.append(visible_points[0])
                return Polyline(tuple(visible_points)).geometry

            self.grid_lines.append(
                DynamicGeometryObject2D(
                    geometry_at,
                    stroke=color,
                    stroke_width=width,
                    z_index=0,
                )
            )

        self.grid = Group(self.grid_lines)

    def construct(self):
        title, basel = self.add(self.title, self.basel)

        with self.parallel(duration=2):
            title.create()
            basel.fade_in()
            basel.move(by=(0, 0.40), frame=WORLD)

        self.wait()

        with self.parallel(duration=1):
            title.morph(to=self.transform_title)
            basel.fade_out()
            basel.move(by=(0, -0.40), frame=WORLD)

        self.wait()

        reveal, deform = self.add(self.grid_reveal, self.grid_deform)
        grid, grid_title = self.add(self.grid, self.grid_title)

        with self.parallel(duration=3):
            reveal.value(to=1, easing=Easing.LINEAR)
            title.fade_out(duration=1)
            grid_title.fade_in(duration=1)

        self.wait()

        deform.value(to=1, duration=3, easing=Easing.SMOOTH)

        self.wait()
        grid_title.morph(to=self.grid_transform_title, duration=1)
        self.wait()


class SineCurveUnitCircle(Scene):
    def setup(self):
        self.canvas = CANVAS

        self.x_axis = Line((-6, 0), (6, 0), stroke=WHITE, stroke_width=4 / 90)
        self.y_axis = Line((-4, -2), (-4, 2), stroke=WHITE, stroke_width=4 / 90)
        self.circle = Circle(
            1, position=(-4, 0), fill=None, stroke=WHITE, stroke_width=4 / 90
        )

        self.labels = Group(
            [
                Math("pi", font_size=48, position=(-1, -0.45)),
                Math("2 pi", font_size=48, position=(1, -0.45)),
                Math("3 pi", font_size=48, position=(3, -0.45)),
                Math("4 pi", font_size=48, position=(5, -0.45)),
            ]
        )

        self.offset = ScalarValue(0)

        def dot_geometry(time):
            u = self.offset.value_at(time)
            a = TAU * (u % 1)
            cx = -4 + cos(a)
            cy = sin(a)
            r = 0.08
            return Polygon(
                [
                    (
                        cx + r * cos(TAU * i / 28),
                        cy + r * sin(TAU * i / 28),
                    )
                    for i in range(28)
                ]
            ).geometry

        self.dot = DynamicGeometryObject2D(
            dot_geometry, fill=Color(255, 255, 0), stroke=None, z_index=8
        )

        blue = Color(88, 196, 221)
        yellow_a = Color(255, 241, 182)
        yellow_d = Color(244, 211, 69)

        def radial_geometry(time):
            u = self.offset.value_at(time)
            a = TAU * (u % 1)
            point = Vec2(-4 + cos(a), sin(a))
            return Line(Vec2(-4, 0), point).geometry

        def connector_geometry(time):
            u = self.offset.value_at(time)
            a = TAU * (u % 1)
            point = Vec2(-4 + cos(a), sin(a))
            end = Vec2(-3 + 4 * u, point.y)
            return Line(point, end).geometry

        def curve_geometry(time):
            u = self.offset.value_at(time)
            if u <= 1e-9:
                p0 = Vec2(-3, 0)
                return Polyline((p0, p0)).geometry
            samples = max(2, int(u * 240))
            points = tuple(
                Vec2(
                    -3 + 4 * u * i / (samples - 1),
                    sin(TAU * u * i / (samples - 1)),
                )
                for i in range(samples)
            )
            return Polyline(points).geometry

        self.radial = DynamicGeometryObject2D(
            radial_geometry, stroke=blue, stroke_width=4 / 90, z_index=2
        )
        self.connector = DynamicGeometryObject2D(
            connector_geometry,
            stroke=yellow_a,
            stroke_width=2 / 90,
            z_index=3,
        )
        self.curve = DynamicGeometryObject2D(
            curve_geometry, stroke=yellow_d, stroke_width=4 / 90, z_index=4
        )

    def construct(self):
        offset = self.add(self.offset)
        self.add(
            self.x_axis,
            self.y_axis,
            self.labels,
            self.circle,
            self.dot,
            self.radial,
            self.connector,
            self.curve,
        )
        offset.value(to=8.5 * 0.25, duration=8.5, easing=Easing.LINEAR)
        self.wait()
