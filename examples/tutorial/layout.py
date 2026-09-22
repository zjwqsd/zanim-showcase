from zanim import (
    BLUE,
    GREEN,
    ORANGE,
    PURPLE,
    Canvas,
    Circle,
    Column,
    Grid,
    Row,
    Scene,
    Square,
    Text,
    Vec2,
)


class LayoutStatic(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)

        def tiles():
            return [
                Square(0.7, fill=BLUE.with_alpha(65), stroke=BLUE),
                Circle(0.38, fill=ORANGE.with_alpha(65), stroke=ORANGE),
                Square(0.55, fill=GREEN.with_alpha(65), stroke=GREEN),
                Circle(0.3, fill=PURPLE.with_alpha(65), stroke=PURPLE),
            ]

        row, column, grid = tiles(), tiles(), tiles()
        Row(gap=0.38, at=Vec2(-3.5, 0)).place(*row)
        Column(gap=0.28, at=Vec2(0, 0)).place(*column)
        Grid(rows=2, cols=2, gap=Vec2(0.45, 0.35), at=Vec2(3.5, 0)).place(*grid)

        self.add(*row, *column, *grid)
        self.add(
            Text("Row", font_size=20, color=BLUE, position=(-3.5, 1.65)),
            Text("Column", font_size=20, color=GREEN, position=(0, 1.65)),
            Text("Grid", font_size=20, color=ORANGE, position=(3.5, 1.65)),
        )


class LayoutTransition(Scene):
    def construct(self):
        self.canvas = Canvas(1280, 720, 92)
        tiles = [
            Square(0.7, fill=BLUE.with_alpha(65), stroke=BLUE),
            Circle(0.38, fill=ORANGE.with_alpha(65), stroke=ORANGE),
            Square(0.55, fill=GREEN.with_alpha(65), stroke=GREEN),
            Circle(0.3, fill=PURPLE.with_alpha(65), stroke=PURPLE),
        ]
        Row(gap=0.55).place(*tiles)
        tiles = self.add(*tiles)

        self.wait(0.5)
        self.layout(*tiles, to=Grid(rows=2, cols=2, gap=Vec2(0.7, 0.55)), duration=1.3)
        self.wait(0.55)
        self.layout(*tiles, to=Row(gap=0.55), duration=1.1)
        self.wait(0.3)
