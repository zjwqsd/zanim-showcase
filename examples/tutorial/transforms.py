from zanim import (
    BLUE,
    GREEN,
    ORANGE,
    WHITE,
    WORLD,
    YELLOW,
    Arrow,
    Canvas,
    Group,
    Line,
    Scene,
    Square,
    Text,
)


class FramesStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)

        def frame_card(name, x, color, rotation):
            axes = Group(
                [
                    Line((0, 0), (1.35, 0), stroke=WHITE, stroke_width=0.035),
                    Line(
                        (0, 0),
                        (0, 1.0),
                        stroke=WHITE.with_alpha(120),
                        stroke_width=0.025,
                    ),
                    Arrow((0, 0), (1.25, 0), color=color),
                ],
                position=(x, -0.35),
                rotation=rotation,
            )
            return axes, Text(name, font_size=20, color=color, position=(x, 1.45))

        visuals = [
            *frame_card("LOCAL", -3.6, BLUE, 0.75),
            *frame_card("PARENT", 0, GREEN, 0.75),
            *frame_card("WORLD", 3.6, ORANGE, 0.75),
        ]
        self.add(*visuals)
        self.add(
            Text(
                "同一个向量，在不同 frame 中有不同含义",
                font_size=20,
                position=(0, -2.35),
            )
        )


class FrameMotion(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        parent = Group(
            [
                Square(1.0, fill=BLUE.with_alpha(45), stroke=BLUE),
                Arrow((0, 0), (1.2, 0), color=YELLOW),
            ],
            position=(-2.5, 0),
            rotation=0.7,
        )
        parent = self.add(parent)

        parent.move(to=(2.2, 0), duration=1.5)
        parent.rotate(by=-1.2, frame=WORLD, duration=1)
        self.wait(0.35)
