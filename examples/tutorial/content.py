from pathlib import Path

from zanim import (
    YELLOW, Canvas, GIF, Image, Math, Row, Scene, Text, Vec2, Video, affine2d,
)

CANVAS = Canvas(1280, 720, 92)
ASSETS = Path(__file__).resolve().parents[1] / "assets" / "media_demo"

class MathStatic(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.equation = Math(
            r'f(x) = integral_0^x e^(-t^2) dif t',
            font_size=36,
            transform=affine2d(position=(0, 1.3)),
        )
        self.matrix = Math(
            r'mat(1, 2; 3, 4) times vec(x, y) = vec(x + 2y, 3x + 4y)',
            font_size=31,
            transform=affine2d(position=(0, -.35)),
        )
        self.identity = Math(
            r'e^(i pi) + 1 = 0',
            font_size=34,
            color=YELLOW,
            transform=affine2d(position=(0, -1.9)),
        )
    def construct(self):
        self.add(self.equation, self.matrix, self.identity)

class MediaDemo(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.fps = 30
        self.image = Image(ASSETS / "image.png", width=3.0)
        self.gif = GIF(ASSETS / "anim.gif", width=2.7)
        self.video = Video(ASSETS / "clip.mp4", width=3.2)
        Row(gap=.55, at=Vec2(0,.2)).place(self.image, self.gif, self.video)
    def construct(self):
        image, gif, video = self.add(self.image, self.gif, self.video)
        self.add(
            Text("Image", font_size=18, transform=affine2d(position=(-3.4,-1.65))),
            Text("GIF", font_size=18, transform=affine2d(position=(0,-1.65))),
            Text("Video", font_size=18, transform=affine2d(position=(3.45,-1.65))),
        )
        with self.parallel(duration=3.8):
            image.media(duration=3.8)
            gif.media(duration=3.8, loop=True)
            video.media(duration=3.8, loop=True)
