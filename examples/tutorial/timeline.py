from zanim import (
    BLUE,
    ORANGE,
    WHITE,
    WORLD,
    YELLOW,
    Canvas,
    Circle,
    Line,
    Scene,
    Square,
)


class Sequence(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        dot = Circle(0.16, fill=YELLOW, stroke=None, position=(-3.2, 0))
        track = Line(
            (-3.2, 0), (3.2, 0), stroke=WHITE.with_alpha(90), stroke_width=0.02
        )
        dot = self.add(dot)
        self.add(track)

        dot.move(to=(0, 0), duration=1)
        dot.move(to=(3.2, 0), duration=1)
        dot.scale(by=2, frame=WORLD, duration=0.6)
        self.wait(0.3)


class Parallel(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        square = Square(
            1.1,
            fill=BLUE.with_alpha(65),
            stroke=BLUE,
            position=(-2.4, 0),
        )
        circle = Circle(
            0.58,
            fill=ORANGE.with_alpha(65),
            stroke=ORANGE,
            position=(2.4, 0),
        )
        square, circle = self.add(square, circle)

        with self.parallel(duration=1.8):
            square.move(to=(2, 0))
            circle.scale(by=1.65, frame=WORLD, at=0.25)
        self.wait(0.35)
