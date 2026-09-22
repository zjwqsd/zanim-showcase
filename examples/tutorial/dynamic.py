from math import cos, sin, tau

from zanim import (
    BLUE,
    ORANGE,
    YELLOW,
    BatchObject2D,
    Canvas,
    CircleSet,
    Color,
    DynamicBatchObject2D,
    DynamicNumber,
    LineSet,
    NumberFormat,
    ScalarValue,
    Scene,
    Text,
    Vec2,
)


class ScalarValueDemo(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        progress = ScalarValue(0)
        number = DynamicNumber(
            progress,
            number_format=NumberFormat(width=6, decimals=1),
            font_size=54,
            color=YELLOW,
            position=(0, 0.3),
        )

        progress, number = self.add(progress, number)
        self.add(
            Text(
                "一个 ScalarValue 驱动显示值",
                font_size=20,
                position=(0, 1.55),
            )
        )
        progress.value(to=100, duration=3.2)
        self.wait(0.35)


class BatchStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        centers, radii, fills = [], [], []
        for y in range(-3, 4):
            for x in range(-7, 8):
                centers.append(Vec2(x * 0.48, y * 0.48))
                radii.append(0.065)
                fills.append(
                    BLUE
                    if (x + y) % 3 == 0
                    else ORANGE
                    if (x - y) % 4 == 0
                    else Color(210, 220, 240, 160)
                )

        dots = BatchObject2D(CircleSet(tuple(centers), tuple(radii), tuple(fills)))
        self.add(
            dots,
            Text(
                "105 circles · one retained batch",
                font_size=20,
                position=(0, 2.25),
            ),
        )


class ProviderMotion(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)

        def radial_lines(t):
            starts, ends, colors, widths = [], [], [], []
            for i in range(42):
                a = i / 42 * tau
                r = 1.55 + 0.2 * sin(t * 2 + i * 0.7)
                starts.append(Vec2(r * cos(a), r * sin(a)))
                ends.append(Vec2((r + 0.48) * cos(a), (r + 0.48) * sin(a)))
                colors.append(BLUE.with_alpha(210))
                widths.append(0.022)
            return LineSet(tuple(starts), tuple(ends), tuple(colors), tuple(widths))

        def moving_point(t):
            return CircleSet(
                (Vec2(2.25 * cos(t * 1.25), 2.25 * sin(t * 1.25)),),
                (0.12,),
                (YELLOW,),
            )

        self.add(
            DynamicBatchObject2D(radial_lines),
            DynamicBatchObject2D(moving_point, z_index=3),
        )
        self.wait(5)
