from zanim import BLUE, ORANGE, WHITE, YELLOW, WORLD, Canvas, Circle, Easing, Line, Scene, Square

CANVAS = Canvas(1280, 720, 92)

class Sequence(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.dot = Circle(.16, fill=YELLOW, stroke=None)
        self.dot.move_to((-3.2, 0))
        self.track = Line((-3.2,0),(3.2,0), stroke=WHITE.with_alpha(90), stroke_width=.02)
    def construct(self):
        dot = self.add(self.dot)
        self.add(self.track)
        dot.move(to=(0,0), duration=1)
        dot.move(to=(3.2,0), duration=1)
        dot.scale(by=2, frame=WORLD, duration=.6)
        self.wait(.3)

class Parallel(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.square = Square(1.1, fill=BLUE.with_alpha(65), stroke=BLUE)
        self.circle = Circle(.58, fill=ORANGE.with_alpha(65), stroke=ORANGE)
        self.square.move_to((-2.4,0)); self.circle.move_to((2.4,0))
    def construct(self):
        square, circle = self.add(self.square, self.circle)
        with self.parallel(duration=1.8):
            square.move(to=(2,0))
            circle.scale(by=1.65, frame=WORLD, at=.25)
        self.wait(.35)
