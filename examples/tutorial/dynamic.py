from math import cos, sin, tau

from zanim import BLUE, ORANGE, YELLOW, Canvas, Color, DynamicNumber, NumberFormat, Scene, Text, Vec2, affine2d
from zanim.batch import BatchObject2D, CircleSet, DynamicBatchObject2D, LineSet
from zanim.value import ScalarValue

CANVAS = Canvas(1280, 720, 92)

class ScalarValueDemo(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.progress = ScalarValue(0)
        self.number = DynamicNumber(
            self.progress,
            number_format=NumberFormat(width=6, decimals=1),
            font_size=54,
            color=YELLOW,
            transform=affine2d(position=(0,.3)),
        )
        self.note = Text(
            "一个 ScalarValue 驱动显示值",
            font_size=20,
            transform=affine2d(position=(0,1.55)),
        )
    def construct(self):
        progress, number = self.add(self.progress, self.number)
        self.add(self.note)
        progress.value(to=100, duration=3.2)
        self.wait(.35)

class BatchStatic(Scene):
    def setup(self):
        self.canvas = CANVAS
        centers=[]; radii=[]; fills=[]
        for y in range(-3,4):
            for x in range(-7,8):
                centers.append(Vec2(x*.48,y*.48))
                radii.append(.065)
                fills.append(BLUE if (x+y)%3==0 else ORANGE if (x-y)%4==0 else Color(210,220,240,160))
        self.dots = BatchObject2D(CircleSet(tuple(centers),tuple(radii),tuple(fills)))
    def construct(self):
        self.add(self.dots)
        self.add(Text("105 circles · one retained batch", font_size=20, transform=affine2d(position=(0,2.25))))

def radial_lines(t):
    starts=[]; ends=[]; colors=[]; widths=[]
    for i in range(42):
        a=i/42*tau
        r=1.55+.2*sin(t*2+i*.7)
        starts.append(Vec2(r*cos(a),r*sin(a)))
        ends.append(Vec2((r+.48)*cos(a),(r+.48)*sin(a)))
        colors.append(BLUE.with_alpha(210))
        widths.append(.022)
    return LineSet(tuple(starts),tuple(ends),tuple(colors),tuple(widths))

def moving_point(t):
    return CircleSet(
        (Vec2(2.25*cos(t*1.25),2.25*sin(t*1.25)),),
        (.12,),
        (YELLOW,),
    )

class ProviderMotion(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.lines = DynamicBatchObject2D(radial_lines)
        self.point = DynamicBatchObject2D(moving_point, z_index=3)
    def construct(self):
        self.add(self.lines,self.point)
        self.wait(5)
