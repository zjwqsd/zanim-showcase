"""Zanim ports of Manim Community v0.21.0 Example Gallery.

Shared helpers stay at module scope so the showcase can display each Scene body
without repeating imports and boilerplate.
"""
from __future__ import annotations
from math import cos, sin, pi

from zanim import (
    BLUE, CYAN, GREEN, ORANGE, PINK, PURPLE, RED, WHITE, YELLOW, TAU, PI, WORLD, Color,
    Arrow, Box3D, Camera3D, Canvas, Circle, Easing, Group, InfiniteGrid,
    Line, Polygon, Polyline, Rectangle, Scene, Square, Text, Transform3D,
    Vec2, Vec3, affine2d,
)

CANVAS = Canvas(1280, 720, 90)

def header(title):
    return Text(title, font_size=31, transform=affine2d(position=(0, 3.25)))

def dot(x, y, color=WHITE, radius=0.09):
    return Circle(radius, position=(x, y), fill=color, stroke=None)

def path(points, color=CYAN, width=0.03, trim=1.0):
    return Polyline(tuple(Vec2(*p) for p in points), stroke=color, stroke_width=width, trim=trim)

class ManimCELogo(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.parts = (
            Circle(1.08, position=(-1.2, -0.15), fill=Color(135,194,165), stroke=None),
            Square(2.0, position=(0.05, 0.86), fill=Color(82,88,147), stroke=None),
            Polygon((Vec2(0, -1.05), Vec2(1.25, 1), Vec2(-1.25, 1)),
                    position=(1.2, -0.12), fill=Color(224,122,95), stroke=None),
            Text("M", font_size=102, color=Color(236,230,226),
                 transform=affine2d(position=(-1.62, 0.6))),
        )
    def construct(self):
        self.add(header("ManimCELogo"), *self.parts)
        self.wait(4)

class BraceAnnotation(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.line = Line((-2.8, -1.15), (2.7, 1.2), stroke=ORANGE, stroke_width=0.05)
        self.brace = Text("⏞", font_size=78, transform=affine2d(position=(0, -1.18), rotation=0.42))
        self.label = Text("Horizontal distance", font_size=21, transform=affine2d(position=(0, -1.75)))
    def construct(self):
        self.add(header("BraceAnnotation"), self.line, dot(-2.8, -1.15, BLUE), dot(2.7, 1.2, GREEN), self.brace, self.label)
        self.wait(4)

class VectorArrow(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.grid = InfiniteGrid(step=0.5, color=BLUE.with_alpha(40), stroke_width=0.012)
        self.arrow = Arrow(Vec2(0, 0), Vec2(2.5, 2), color=BLUE)
    def construct(self):
        self.add(header("VectorArrow"), self.grid, dot(0, 0), self.arrow)
        self.wait(4)

class GradientImageFromArray(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.bars = []
        for i in range(96):
            v = round(255 * i / 95)
            self.bars.append(Rectangle(0.07, 3.6, position=(-3.3 + i * 0.07, -0.1), fill=Color(v, v, v, 255), stroke=None))
        self.border = Rectangle(6.7, 3.7, fill=None, stroke=GREEN, stroke_width=0.045)
    def construct(self):
        self.add(header("GradientImageFromArray"), Group(self.bars), self.border)
        self.wait(4)

class BooleanOperations(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.left_a = Circle(1.45, position=(-3.75, -0.05), fill=BLUE.with_alpha(90), stroke=BLUE, opacity=0)
        self.left_b = Circle(1.45, position=(-2.15, -0.05), fill=RED.with_alpha(86), stroke=RED, opacity=0)
        self.source_label = Text("Boolean Operation", font_size=23, opacity=0, transform=affine2d(position=(-2.95, 2.05)))
        self.results = []
        for name, x, y, color in (("Intersection",2.1,1.45,GREEN),("Union",4.45,1.45,ORANGE),("Difference",2.1,-1.25,PINK),("Exclusion",4.45,-1.25,YELLOW)):
            a = Circle(0.58, position=(x-.24,y), fill=color.with_alpha(66), stroke=color, opacity=0)
            b = Circle(0.58, position=(x+.24,y), fill=color.with_alpha(46), stroke=color, opacity=0)
            label = Text(name, font_size=16, color=color, opacity=0, transform=affine2d(position=(x,y+.9)))
            self.results.append((a,b,label))
    def construct(self):
        self.add(header("BooleanOperations"), self.left_a, self.left_b, self.source_label, *(o for row in self.results for o in row))
        left_a, left_b, source_label = self.on(self.left_a), self.on(self.left_b), self.on(self.source_label)
        with self.parallel(duration=.85):
            left_a.fade_in(); left_b.fade_in(at=.08); source_label.fade_in(at=.16)
        self.wait(.2)
        for a,b,label in self.results:
            a, b, label = self.on(a), self.on(b), self.on(label)
            with self.parallel(duration=.62):
                a.fade_in(); b.fade_in(at=.08); label.fade_in(at=.18)
            self.wait(.15)
        with self.parallel(duration=.55):
            left_a.scale(by=.78,frame=WORLD); left_b.scale(by=.78,frame=WORLD)
        with self.parallel(duration=.35):
            left_a.rotate(by=-.18,frame=WORLD); left_b.rotate(by=.18,frame=WORLD)
        self.wait(.55)

class PointMovingOnShapes(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.circle = Circle(1.35, stroke=GREEN, fill=None)
        self.marker = dot(-4.7, -1.1, YELLOW, .12)
    def construct(self):
        marker = self.add(self.marker)
        self.add(header("PointMovingOnShapes"), Line((-4.7,-1.1),(-2.7,1.1),stroke=BLUE), self.circle)
        marker.move(by=(2.0,2.2), frame=WORLD, duration=1)
        marker.transform_function(lambda a: affine2d(position=(1.35*cos(TAU*a),1.35*sin(TAU*a))), duration=2, easing=Easing.LINEAR)
        marker.transform_function(lambda a: affine2d(position=(3.5+cos(TAU*a),-.25+sin(TAU*a))), duration=2, easing=Easing.LINEAR)
        self.wait(.5)

class MovingAround(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.square = Square(1.5, fill=BLUE.with_alpha(160), stroke=BLUE)
    def construct(self):
        square = self.add(self.square); self.add(header("MovingAround"))
        square.move(by=(-2.8,.4), frame=WORLD, duration=1)
        square.paint(fill=ORANGE.with_alpha(180), stroke=ORANGE, duration=1)
        square.scale(by=.3, frame=WORLD, duration=1)
        square.rotate(by=.4, frame=WORLD, duration=1)

class MovingAngle(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.ray = Line((-3.4,0),(-3.4+5.1*cos(110*pi/180),5.1*sin(110*pi/180)),stroke=BLUE,stroke_width=.045)
        self.theta = Text("θ",font_size=28,color=YELLOW,transform=affine2d(position=(-2.48,.62)))
    def construct(self):
        ray,theta = self.add(self.ray,self.theta)
        self.add(header("MovingAngle"),Line((-3.4,0),(3.4,0),stroke=WHITE))
        self.wait(.5)
        ray.rotate(by=-70*pi/180, about=Vec2(-3.4,0), duration=1)
        ray.rotate(by=140*pi/180, about=Vec2(-3.4,0), duration=1)
        theta.opacity(to=.45, duration=.25); theta.opacity(to=1, duration=.25)
        ray.rotate(by=170*pi/180, about=Vec2(-3.4,0), duration=1.2)

class MovingDots(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.d1 = dot(-.5,0,BLUE,.12); self.d2 = dot(.5,0,GREEN,.12)
    def construct(self):
        d1,d2 = self.add(self.d1,self.d2)
        self.add(header("MovingDots"), Line((-.5,0),(.5,0),stroke=RED))
        d1.move(by=(5,0),frame=WORLD,duration=1.5); d2.move(by=(0,4),frame=WORLD,duration=1.5); self.wait(.5)

class MovingGroupToDestination(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.group = Group([Circle(.55,position=(-.75,0),fill=BLUE), Square(1,position=(.75,0),fill=GREEN)])
        self.target = Rectangle(3.4,1.8,position=(3.2,.3),fill=None,stroke=WHITE)
    def construct(self):
        group = self.add(self.group); self.add(header("MovingGroupToDestination"),self.target)
        group.move(by=(3.2,.3),frame=WORLD,duration=2); group.rotate(by=PI/3,frame=WORLD,duration=1.2); self.wait(.5)

class MovingFrameBox(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.text = Text("d/dx [f(x)g(x)] = f(x)g′(x) + g(x)f′(x)", font_size=30, opacity=0)
        self.box = Rectangle(2.3,.9,position=(1.0,0),fill=None,stroke=YELLOW,opacity=0)
    def construct(self):
        text,box = self.add(self.text,self.box); self.add(header("MovingFrameBox"))
        text.fade_in(duration=.7); box.fade_in(duration=.6); self.wait(.6)
        box.move(by=(3.1,0),frame=WORLD,duration=1); self.wait(.6)

class RotationUpdater(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.line = Line((0,0),(3.1,0),stroke=BLUE,stroke_width=.055)
    def construct(self):
        line = self.add(self.line); self.add(header("RotationUpdater"))
        line.transform_function(lambda a: affine2d(rotation=TAU*1.4*a),duration=5,easing=Easing.LINEAR)

class PointWithTrace(Scene):
    def setup(self):
        self.canvas = CANVAS
        pts=[(-4+i*.04,1.7*sin(i*.07)) for i in range(200)]
        self.trace = path(pts,CYAN,.045,trim=0)
        self.point = dot(-4,0,YELLOW,.11)
    def construct(self):
        trace,point = self.add(self.trace,self.point); self.add(header("PointWithTrace"))
        with self.parallel(duration=4.5):
            trace.create(easing=Easing.LINEAR)
            point.move(by=(7.9,0),frame=WORLD)
        self.wait(.5)

class SinAndCosFunctionPlot(Scene):
    def setup(self):
        self.canvas = CANVAS
        xs=[-8+16*i/299 for i in range(300)]
        self.sin_curve=path([(x*.62,sin(x)*1.35) for x in xs],BLUE,.035)
        self.cos_curve=path([(x*.62,cos(x)*1.35) for x in xs],RED,.035)
    def construct(self):
        self.add(header("SinAndCosFunctionPlot"),InfiniteGrid(step=1,color=BLUE.with_alpha(30)),self.sin_curve,self.cos_curve)
        self.wait(4)

class ArgMinExample(Scene):
    def setup(self):
        self.canvas = CANVAS
        xs=[i*10/220 for i in range(221)]
        self.curve=path([(-4.8+x*.96,-1.8+2*(x-5)**2*.037) for x in xs],PINK,.035)
        self.point=dot(-4.8,-1.8+50*.037,YELLOW,.11)
    def construct(self):
        point=self.add(self.point); self.add(header("ArgMinExample"),self.curve)
        point.move(by=(4.8,-50*.037),frame=WORLD,duration=2.8); self.wait(.7)

class GraphAreaPlot(Scene):
    def setup(self):
        self.canvas = CANVAS
        xs=[4*i/180 for i in range(181)]
        self.f1=path([(-4.5+x*1.7,-2.1+(4*x-x*x)*.7) for x in xs],BLUE,.035)
        self.f2=path([(-4.5+x*1.7,-2.1+(.8*x*x-3*x+4)*.7) for x in xs],GREEN,.035)
    def construct(self):
        self.add(header("GraphAreaPlot"),InfiniteGrid(step=1,color=BLUE.with_alpha(25)),self.f1,self.f2)
        self.wait(4)

class PolygonOnAxes(Scene):
    def setup(self):
        self.canvas = CANVAS
        xs=[2.5+(10-2.5)*i/180 for i in range(181)]
        self.curve=path([(-4.6+x*.72,-2.25+(25/x)*.42) for x in xs],YELLOW,.035)
        self.point=dot(-1.0,-.15,ORANGE,.11)
        self.box=Rectangle(2.4,2.0,position=(-3.3,-.8),fill=BLUE.with_alpha(65),stroke=YELLOW)
    def construct(self):
        point,box=self.add(self.point,self.box); self.add(header("PolygonOnAxes"),self.curve)
        with self.parallel(duration=1.8):
            point.move(by=(3.4,-.8),frame=WORLD); box.scale(by=1.45,frame=WORLD)
        with self.parallel(duration=2):
            point.move(by=(-2.8,1.1),frame=WORLD); box.scale(by=.68,frame=WORLD)
        self.wait(.4)

class HeatDiagramPlot(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.curve=path(((-4.8,1.05),(-2.9,-1.55),(4.1,-1.55),(4.35,-2.2)),BLUE,.05)
    def construct(self):
        self.add(header("HeatDiagramPlot"),InfiniteGrid(step=.8,color=BLUE.with_alpha(25)),self.curve)
        self.wait(4)

class FollowingGraphCamera(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.curve=path([(-4.5+i*.04,1.2*sin(i*.06)) for i in range(225)],BLUE,.04)
        self.point=dot(-4.5,0,ORANGE,.12)
    def construct(self):
        point=self.add(self.point); self.add(header("FollowingGraphCamera"),self.curve)
        self.camera.affine(position=(-2.5,0),scale=1.7,duration=1)
        with self.parallel(duration=4):
            point.move(by=(8.8,0),frame=WORLD,easing=Easing.LINEAR)
            self.camera.affine(position=(2.5,0),scale=1.7,easing=Easing.LINEAR)
        self.camera.affine(position=(0,0),scale=1,duration=1)

class MovingZoomedSceneAround(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.image=Rectangle(8.5,4.6,fill=BLUE.with_alpha(50),stroke=None)
        self.focus=Rectangle(1.5,1,position=(-2.2,.6),fill=None,stroke=YELLOW,opacity=0)
    def construct(self):
        focus=self.add(self.focus); self.add(header("MovingZoomedSceneAround"),self.image)
        focus.fade_in(duration=.6); focus.scale(by=.6,frame=WORLD,duration=1)
        focus.scale(by=2,frame=WORLD,duration=1); focus.move(by=(0,-2.5),frame=WORLD,duration=1)
        focus.scale(by=.5,frame=WORLD,duration=.8); focus.fade_out(duration=.6)
        self.wait(.4)

class FixedInFrameMObjectTest(Scene):
    def setup(self):
        self.canvas = CANVAS
        self.grid=InfiniteGrid(step=.5,color=BLUE.with_alpha(30))
        self.label=Text("Fixed in frame",font_size=22,color=YELLOW,transform=affine2d(position=(0,-2.4)))
    def construct(self):
        self.add(header("FixedInFrameMObjectTest"),self.grid,self.label); self.wait(4)

class ThreeDLightSourcePosition(Scene):
    def __init__(self):
        super().__init__(canvas=CANVAS,camera3d=Camera3D(position=Vec3(5,4,7),target=Vec3(),fov_y_degrees=34))
    def setup(self):
        self.platform=Box3D(Vec3(2.2,2.2,.25),color=BLUE,transform=Transform3D.translation(-1.3,0,0))
        self.cube=Box3D(Vec3(2,2,2),color=GREEN,transform=Transform3D.translation(1.3,0,.6))
    def construct(self):
        self.add(self.platform,self.cube); self.wait(4)

class ThreeDCameraRotation(Scene):
    def __init__(self):
        super().__init__(canvas=CANVAS,camera3d=Camera3D(position=Vec3(5.5,4.5,7.5),target=Vec3(),fov_y_degrees=34))
    def setup(self):
        self.cube=Box3D(Vec3(2.2,2.2,2.2),color=BLUE)
    def construct(self):
        cube=self.add(self.cube)
        cube.transform_function(lambda a: Transform3D.rotation_z(TAU*a) @ Transform3D.rotation_y(TAU*.7*a),duration=6,easing=Easing.LINEAR)

class ThreeDCameraIllusionRotation(Scene):
    def __init__(self):
        super().__init__(canvas=CANVAS,camera3d=Camera3D(position=Vec3(5.5,4.2,7.5),target=Vec3(),fov_y_degrees=34))
    def setup(self):
        self.bars=(Box3D(Vec3(3.4,.18,.18),color=RED),Box3D(Vec3(.18,3.4,.18),color=GREEN),Box3D(Vec3(.18,.18,3.4),color=BLUE))
    def construct(self):
        bars=self.add(*self.bars)
        with self.parallel(duration=6):
            for bar in bars:
                bar.transform_function(lambda a: Transform3D.rotation_z(TAU*a),easing=Easing.LINEAR)

class ThreeDSurfacePlot(Scene):
    def __init__(self):
        super().__init__(canvas=CANVAS,camera3d=Camera3D(position=Vec3(6.5,5.2,8.5),target=Vec3(),fov_y_degrees=34))
    def setup(self):
        self.tiles=[]
        for ix in range(-5,6):
            for iy in range(-5,6):
                x,y=ix*.42,iy*.42; z=.75*cos(x*1.4)*cos(y*1.4)
                self.tiles.append(Box3D(Vec3(.36,.36,.08),color=BLUE if z>0 else PURPLE,transform=Transform3D.translation(x,y,z)))
    def construct(self):
        self.add(*self.tiles); self.wait(4)

class OpeningManim(Scene):
    def setup(self):
        self.canvas=CANVAS
        self.title=Text("This is some LaTeX",font_size=40,opacity=0)
        self.formula=Text("Σ 1/n² = π²/6",font_size=44,color=YELLOW,opacity=0,transform=affine2d(position=(0,-.8)))
        self.grid=InfiniteGrid(step=.5,color=BLUE.with_alpha(35),opacity=0)
    def construct(self):
        title,formula,grid=self.add(self.title,self.formula,self.grid)
        with self.parallel(duration=.8):
            title.fade_in(); formula.fade_in(at=.12)
        self.wait(.5)
        with self.parallel(duration=.8):
            title.move(by=(-3.4,2.3),frame=WORLD); formula.fade_out()
        self.wait(.4)
        grid.fade_in(duration=.8); self.wait(.4)
        grid.transform_function(lambda a: affine2d(shear=(.7*a,.45*sin(PI*a))),duration=3)
        self.wait(.5)

class SineCurveUnitCircle(Scene):
    def setup(self):
        self.canvas=CANVAS
        self.circle=Circle(1.45,position=(-3.5,0),fill=None,stroke=WHITE)
        self.curve=path([(-1.5+i*.035,1.45*sin(i*.05)) for i in range(240)],BLUE,.04,trim=0)
        self.dot=dot(-2.05,0,YELLOW,.1)
    def construct(self):
        curve,dot_obj=self.add(self.curve,self.dot); self.add(header("SineCurveUnitCircle"),self.circle)
        with self.parallel(duration=7):
            curve.create(easing=Easing.LINEAR)
            dot_obj.transform_function(lambda a: affine2d(position=(-3.5+1.45*cos(TAU*1.35*a),1.45*sin(TAU*1.35*a))),easing=Easing.LINEAR)
        self.wait(.4)
