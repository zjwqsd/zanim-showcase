from zanim import BLUE, GREEN, WHITE, YELLOW, Arrow, Canvas, Rectangle, Scene, Text


class IRStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        boxes = []
        for x, text, color in (
            (-3.7, "Python Scene", BLUE),
            (0, "Scene IR", YELLOW),
            (3.7, "Web Scene", GREEN),
        ):
            boxes.extend(
                [
                    Rectangle(
                        2.7,
                        1.25,
                        fill=None,
                        stroke=color,
                        stroke_width=0.028,
                        position=(x, 0),
                    ),
                    Text(text, font_size=25, color=color, position=(x, 0)),
                ]
            )

        self.add(*boxes)
        self.add(
            Arrow((-2.25, 0), (-1.45, 0), color=WHITE),
            Arrow((1.45, 0), (2.25, 0), color=WHITE),
            Text("可移植状态", font_size=18, position=(0, -1.35)),
            Text(
                "任意 Python callback 不会被伪装成通用 IR",
                font_size=18,
                position=(0, -2.15),
            ),
        )
