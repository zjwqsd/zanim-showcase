from zanim import (
    BLUE, GREEN, ORANGE, WHITE, YELLOW, WORLD,
    Arrow, Canvas, Circle, Color, Group, Line, Scene, Square, Text, Vec2, affine2d,
)

CANVAS = Canvas(1280, 720, 92)

class ObjectsStatic(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.square = Square(1.15, fill=BLUE.with_alpha(70), stroke=BLUE)
        self.circle = Circle(.62, fill=ORANGE.with_alpha(70), stroke=ORANGE)
        self.arrow = Arrow(Vec2(-1, -1.4), Vec2(1, -1.4), color=GREEN)
        self.text = Text("Text", font_size=34)
        self.square.move_to((-2.5, .25))
        self.circle.move_to((0, .25))
        self.text.move_to((2.55, .25))
    def construct(self):
        self.add(self.square, self.circle, self.arrow, self.text)
        self.add(
            Text("Square", font_size=18, color=Color(149,160,184), transform=affine2d(position=(-2.5,-1))),
            Text("Circle", font_size=18, color=Color(149,160,184), transform=affine2d(position=(0,-1))),
            Text("Arrow", font_size=18, color=Color(149,160,184), transform=affine2d(position=(0,-1.85))),
            Text("Text", font_size=18, color=Color(149,160,184), transform=affine2d(position=(2.55,-1))),
        )

class FirstAnimation(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.square = Square(1.2, fill=BLUE.with_alpha(70), stroke=BLUE)
        self.square.move_to((-2.8, 0))
    def construct(self):
        square = self.add(self.square)
        square.move(to=(2.8, 0), duration=1.6)
        square.rotate(by=1.5708, frame=WORLD, duration=.8)
        square.scale(by=1.35, frame=WORLD, duration=.7)
        self.wait(.35)

class GroupStatic(Scene):
    def setup(self):
        self.canvas = CANVAS
        child = Group([
            Line((0,0),(1.55,0), stroke=GREEN, stroke_width=.065),
            Circle(.12, fill=ORANGE, stroke=None),
        ])
        child.transform = affine2d(position=(2,0), rotation=.7)
        self.arm = Group([
            Line((0,0),(2,0), stroke=BLUE, stroke_width=.07),
            Circle(.13, fill=YELLOW, stroke=None),
            child,
        ])
        self.arm.transform = affine2d(position=(-1.4,-.25), rotation=-.25)
    def construct(self):
        self.add(self.arm)
        self.add(
            Text("parent Group transform", font_size=20, color=BLUE, transform=affine2d(position=(-2.1,1.6))),
            Text("child local transform", font_size=20, color=GREEN, transform=affine2d(position=(1.65,1.15))),
        )

class Lifecycle(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.immediate = Square(1.05, fill=BLUE.with_alpha(70), stroke=BLUE)
        self.hidden = Circle(.58, fill=GREEN.with_alpha(70), stroke=GREEN, opacity=0)
        self.late = Square(.85, fill=ORANGE.with_alpha(70), stroke=ORANGE)
        self.immediate.move_to((-2.7,0)); self.late.move_to((2.7,0))
    def construct(self):
        immediate, hidden = self.add(self.immediate, self.hidden)
        self.wait(.7)
        hidden.fade_in(duration=.7)
        self.wait(.45)
        self.add(self.late)
        self.wait(.7)
        self.remove(immediate)
        self.wait(.65)
