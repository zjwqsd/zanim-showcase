from __future__ import annotations

import math

from PIL import Image as PILImage
from PIL import ImageChops, ImageDraw
from zanim import Canvas, Color, Easing, Group, Scene, Square, Transform2D, Vec2
from zanim.raster import RasterFrame, RasterObject2D, RasterSource, SceneRasterSource

BLUE = Color(80, 145, 255)
OFFSCREEN = Canvas(width=960, height=540, unit_size=67.5)
FRAME_W = OFFSCREEN.width / OFFSCREEN.unit_size
FRAME_H = OFFSCREEN.height / OFFSCREEN.unit_size


def _grid_scene(indices: range | list[int]) -> Scene:
    sc = Scene(canvas=OFFSCREEN, fps=30)
    squares = []
    for i in indices:
        row, col = divmod(i, 7)
        p = Vec2((col - 3) * 0.62, (3 - row) * 0.62)
        squares.append(
            Square(
                0.5,
                position=p,
                fill=BLUE.with_alpha(76),
                stroke=BLUE.with_alpha(190),
                stroke_width=0.025,
            )
        )
    group = Group(squares)
    group = sc.add(group)
    group.transform_function(
        lambda a: Transform2D.rotation(math.tau * a), duration=8, easing=Easing.LINEAR
    )
    return sc


class _EffectSource(RasterSource):
    def __init__(self, source: RasterSource):
        self.source = source
        self.width = source.width
        self.height = source.height
        self.duration = source.duration
        self.frame_count = source.frame_count


class GradientSource(_EffectSource):
    def frame_at(self, source_time: float) -> RasterFrame:
        t = source_time
        frame = self.source.frame_at(t)
        if t < 2:
            return frame
        image = PILImage.frombuffer(
            "RGBA", (self.width, self.height), bytes(frame.rgba), "raw", "RGBA", 0, 1
        )
        r, g, b, a = image.split()
        vertical = PILImage.linear_gradient("L").resize((self.width, self.height))
        horizontal = vertical.transpose(PILImage.Transpose.ROTATE_90).resize(
            (self.width, self.height)
        )
        g = ImageChops.multiply(g, horizontal)
        b = ImageChops.multiply(b, vertical)
        return RasterFrame(
            self.width,
            self.height,
            bytearray(PILImage.merge("RGBA", (r, g, b, a)).tobytes()),
        )


class GlitchSource(_EffectSource):
    def frame_at(self, source_time: float) -> RasterFrame:
        t = source_time
        frame = self.source.frame_at(t)
        if t < 4:
            return frame
        image = PILImage.frombuffer(
            "RGBA", (self.width, self.height), bytes(frame.rgba), "raw", "RGBA", 0, 1
        )
        r, g, b, a = image.split()
        offset = round(math.sin(t) * 0.02 * self.width)
        rs = ImageChops.offset(r, offset)
        bs = ImageChops.offset(b, -offset)
        a1 = ImageChops.offset(a, offset)
        a2 = ImageChops.offset(a, -offset)
        alpha = ImageChops.lighter(a, ImageChops.lighter(a1, a2))
        lines = PILImage.new("L", (self.width, self.height), 0)
        draw = ImageDraw.Draw(lines)
        for y in range(self.height):
            uv = y / max(1, self.height - 1)
            if (uv * 10.0 + t) % 1.0 >= 0.5:
                draw.line((0, y, self.width, y), fill=255)
        rs = ImageChops.multiply(rs, lines)
        bs = ImageChops.multiply(bs, lines)
        return RasterFrame(
            self.width,
            self.height,
            bytearray(PILImage.merge("RGBA", (rs, g, bs, alpha)).tobytes()),
        )


class FrameEffectExample(Scene):
    def setup(self) -> None:
        self.canvas = Canvas(width=1920, height=1080, unit_size=135)
        self.fps = 30
        even = GradientSource(SceneRasterSource(_grid_scene(list(range(0, 49, 2)))))
        odd = GlitchSource(SceneRasterSource(_grid_scene(list(range(1, 49, 2)))))
        self.even = RasterObject2D(even, width=FRAME_W, height=FRAME_H)
        self.odd = RasterObject2D(odd, width=FRAME_W, height=FRAME_H)

    def construct(self) -> None:
        e, o = self.add(self.even, self.odd)
        with self.parallel():
            e.media(duration=8)
            o.media(duration=8)
