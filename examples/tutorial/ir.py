from zanim import BLUE, GREEN, WHITE, YELLOW, Arrow, Canvas, Rectangle, Scene, Text, affine2d

CANVAS = Canvas(1280, 720, 92)

class IRStatic(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.boxes = []
        for x, text, color in (
            (-3.7, "Python Scene", BLUE),
            (0, "Scene IR", YELLOW),
            (3.7, "Web Scene", GREEN),
        ):
            self.boxes.extend([
                Rectangle(2.7,1.25,fill=None,stroke=color,stroke_width=.028,transform=affine2d(position=(x,0))),
                Text(text,font_size=25,color=color,transform=affine2d(position=(x,0))),
            ])
    def construct(self):
        self.add(*self.boxes)
        self.add(
            Arrow((-2.25,0),(-1.45,0),color=WHITE),
            Arrow((1.45,0),(2.25,0),color=WHITE),
            Text("可移植状态",font_size=18,transform=affine2d(position=(0,-1.35))),
            Text("任意 Python callback 不会被伪装成通用 IR",font_size=18,transform=affine2d(position=(0,-2.15))),
        )
