from zanim import BLUE, GREEN, ORANGE, PURPLE, WORLD, Canvas, Circle, Column, Grid, Row, Scene, Square, Text, Vec2, affine2d

CANVAS = Canvas(1280, 720, 92)

def make_set():
    return [
        Square(.7, fill=BLUE.with_alpha(65), stroke=BLUE),
        Circle(.38, fill=ORANGE.with_alpha(65), stroke=ORANGE),
        Square(.55, fill=GREEN.with_alpha(65), stroke=GREEN),
        Circle(.3, fill=PURPLE.with_alpha(65), stroke=PURPLE),
    ]

class LayoutStatic(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.row = make_set(); self.column = make_set(); self.grid = make_set()
        Row(gap=.38, at=Vec2(-3.5,0)).place(*self.row)
        Column(gap=.28, at=Vec2(0,0)).place(*self.column)
        Grid(rows=2, cols=2, gap=Vec2(.45,.35), at=Vec2(3.5,0)).place(*self.grid)
    def construct(self):
        self.add(*self.row, *self.column, *self.grid)
        self.add(
            Text("Row", font_size=20, color=BLUE, transform=affine2d(position=(-3.5,1.65))),
            Text("Column", font_size=20, color=GREEN, transform=affine2d(position=(0,1.65))),
            Text("Grid", font_size=20, color=ORANGE, transform=affine2d(position=(3.5,1.65))),
        )

class LayoutTransition(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.tiles = make_set()
        Row(gap=.55, at=Vec2()).place(*self.tiles)
    def construct(self):
        self.add(*self.tiles)
        self.wait(.5)
        self.layout(*self.tiles, to=Grid(rows=2, cols=2, gap=Vec2(.7,.55), at=Vec2()), duration=1.3)
        self.wait(.55)
        self.layout(*self.tiles, to=Row(gap=.55, at=Vec2()), duration=1.1)
        self.wait(.3)
