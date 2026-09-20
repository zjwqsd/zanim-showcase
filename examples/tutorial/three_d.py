from zanim import BLUE, GREEN, TAU, Box3D, Camera3D, Canvas, Easing, Scene, Transform3D, Vec3

CANVAS = Canvas(1280, 720, 92)

class ThreeDStatic(Scene):
    def __init__(self):
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(
                position=Vec3(5.8,4.4,7.4),
                target=Vec3(),
                fov_y_degrees=36,
            ),
        )
    def setup(self):
        self.left = Box3D(
            Vec3(2,2,2),
            color=BLUE,
            transform=Transform3D.translation(-1.4,0,0),
        )
        self.right = Box3D(
            Vec3(1.4,2.8,1.4),
            color=GREEN,
            transform=Transform3D.translation(1.45,0,0),
        )
    def construct(self):
        self.add(self.left,self.right)

class ThreeDMotion(Scene):
    def __init__(self):
        super().__init__(
            canvas=CANVAS,
            camera3d=Camera3D(
                position=Vec3(5.8,4.4,7.4),
                target=Vec3(),
                fov_y_degrees=36,
            ),
        )
    def setup(self):
        self.cube = Box3D(Vec3(2.2,2.2,2.2), color=BLUE)
    def construct(self):
        cube = self.add(self.cube)
        cube.transform_function(
            lambda a: Transform3D.rotation_y(TAU*a) @ Transform3D.rotation_z(TAU*.4*a),
            duration=5,
            easing=Easing.LINEAR,
        )
