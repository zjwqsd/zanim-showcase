from pathlib import Path

from zanim import GIF, YELLOW, Canvas, Image, Math, Row, Scene, Text, Vec2, Video


class MathStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        self.add(
            Math(
                r"f(x) = integral_0^x e^(-t^2) dif t",
                font_size=36,
                position=(0, 1.3),
            ),
            Math(
                r"mat(1, 2; 3, 4) times vec(x, y) = vec(x + 2y, 3x + 4y)",
                font_size=31,
                position=(0, -0.35),
            ),
            Math(
                r"e^(i pi) + 1 = 0",
                font_size=34,
                color=YELLOW,
                position=(0, -1.9),
            ),
        )


class MediaDemo(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        self.fps = 30
        assets = Path(__file__).resolve().parents[1] / "assets" / "media_demo"

        image = Image(assets / "image.png", width=3.0)
        gif = GIF(assets / "anim.gif", width=2.7)
        video = Video(assets / "clip.mp4", width=3.2)
        Row(gap=0.55, at=Vec2(0, 0.2)).place(image, gif, video)

        image, gif, video = self.add(image, gif, video)
        self.add(
            Text("Image", font_size=18, position=(-3.4, -1.65)),
            Text("GIF", font_size=18, position=(0, -1.65)),
            Text("Video", font_size=18, position=(3.45, -1.65)),
        )
        with self.parallel(duration=3.8):
            image.media(duration=3.8)
            gif.media(duration=3.8, loop=True)
            video.media(duration=3.8, loop=True)
