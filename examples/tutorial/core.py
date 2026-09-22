from zanim import (
    BLUE,
    GREEN,
    MUTED,
    ORANGE,
    WORLD,
    YELLOW,
    Arrow,
    Canvas,
    Circle,
    Group,
    Line,
    Scene,
    Square,
    Text,
    Vec2,
)


class ObjectsStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        square = Square(
            1.15,
            fill=BLUE.with_alpha(70),
            stroke=BLUE,
            position=(-2.5, 0.25),
        )
        circle = Circle(
            0.62,
            fill=ORANGE.with_alpha(70),
            stroke=ORANGE,
            position=(0, 0.25),
        )
        arrow = Arrow(Vec2(-1, -1.4), Vec2(1, -1.4), color=GREEN)
        text = Text("Text", font_size=34, position=(2.55, 0.25))

        self.add(square, circle, arrow, text)
        self.add(
            Text("Square", font_size=18, color=MUTED, position=(-2.5, -1)),
            Text("Circle", font_size=18, color=MUTED, position=(0, -1)),
            Text("Arrow", font_size=18, color=MUTED, position=(0, -1.85)),
            Text("Text", font_size=18, color=MUTED, position=(2.55, -1)),
        )


class FirstAnimation(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        square = Square(
            1.2,
            fill=BLUE.with_alpha(70),
            stroke=BLUE,
            position=(-2.8, 0),
        )
        square = self.add(square)

        square.move(to=(2.8, 0), duration=1.6)
        square.rotate(by=1.5708, frame=WORLD, duration=0.8)
        square.scale(by=1.35, frame=WORLD, duration=0.7)
        self.wait(0.35)


class GroupStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        child = Group(
            [
                Line((0, 0), (1.55, 0), stroke=GREEN, stroke_width=0.065),
                Circle(0.12, fill=ORANGE, stroke=None),
            ],
            position=(2, 0),
            rotation=0.7,
        )
        arm = Group(
            [
                Line((0, 0), (2, 0), stroke=BLUE, stroke_width=0.07),
                Circle(0.13, fill=YELLOW, stroke=None),
                child,
            ],
            position=(-1.4, -0.25),
            rotation=-0.25,
        )

        self.add(arm)
        self.add(
            Text(
                "parent Group transform",
                font_size=20,
                color=BLUE,
                position=(-2.1, 1.6),
            ),
            Text(
                "child local transform",
                font_size=20,
                color=GREEN,
                position=(1.65, 1.15),
            ),
        )


class Lifecycle(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        immediate = Square(
            1.05,
            fill=BLUE.with_alpha(70),
            stroke=BLUE,
            position=(-2.7, 0),
        )
        hidden = Circle(0.58, fill=GREEN.with_alpha(70), stroke=GREEN, opacity=0)
        late = Square(
            0.85,
            fill=ORANGE.with_alpha(70),
            stroke=ORANGE,
            position=(2.7, 0),
        )

        immediate, hidden = self.add(immediate, hidden)
        self.wait(0.7)
        hidden.fade_in(duration=0.7)
        self.wait(0.45)
        self.add(late)
        self.wait(0.7)
        immediate.remove()
        self.wait(0.65)
