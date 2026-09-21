export const janimOfficialExamples = [
  {
    "id": "janim-hello",
    "title": "HelloJAnimExample",
    "anchor": "hellojanimexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/HelloJAnimExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#hellojanimexample",
    "code": "from janim.imports import *\n\nclass HelloJAnimExample(Timeline):\n    def construct(self):\n        # 定义物件\n        circle = Circle(color=BLUE)\n        square = Square(color=GREEN, fill_alpha=0.5)\n\n        # 进行动画\n        self.forward()\n        self.play(Create(circle))\n        self.play(Transform(circle, square))\n        self.play(Uncreate(square))\n        self.forward()\n"
  },
  {
    "id": "janim-basic",
    "title": "BasicAnimationExample",
    "anchor": "basicanimationexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/BasicAnimationExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#basicanimationexample",
    "code": "from janim.imports import *\n\nclass BasicAnimationExample(Timeline):\n    def construct(self):\n        circle = Circle()\n        star = Star()\n\n        self.forward()\n\n        self.play(Create(circle))\n        self.play(circle.anim.points.shift(LEFT * 3).scale(1.5))\n        self.play(circle.anim.set(color=RED, fill_alpha=0.5))\n\n        self.play(SpinInFromNothing(star))\n        self.play(star.anim.points.shift(RIGHT * 3).scale(1.5))\n        self.play(star.anim.set(color=YELLOW, fill_alpha=0.5))\n\n        self.forward()\n"
  },
  {
    "id": "janim-text",
    "title": "TextExample",
    "anchor": "textexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/TextExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#textexample",
    "code": "from janim.imports import *\n\nclass TextExample(Timeline):\n    def construct(self):\n        txt = Text('Here is some text', font_size=64)\n        desc = Group(\n            Text('You can also apply <c BLUE>styles</c> to the text.', format=Text.Format.RichText),\n            Text('You can also apply <c GREEN><fs 1.4>styles</fs></c> to the text.', format=Text.Format.RichText),\n        )\n        group = Group(txt, desc)\n        group.points.arrange(DOWN, buff=MED_LARGE_BUFF)\n\n        self.forward()\n        self.play(Write(txt))\n        self.play(FadeIn(desc[0], UP))\n        self.play(Transform(desc[0], desc[1]))\n        self.forward()\n"
  },
  {
    "id": "janim-typst",
    "title": "TypstExample",
    "anchor": "typstexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/TypstExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#typstexample",
    "code": "from janim.imports import *\n\ntypst_doc = t_(\nR'''\nJAnim provides `TypstText` and `TypstMath` classes to insert Typst content.\n\nMath expressions are also supported.\n\n$ A = pi r^2 $\n$ \"area\" = pi dot \"radius\"^2 $\n$ cal(A) :=\n    { x in RR | x \"is natural\" } $\n#let x = 5\n$ #x < 17 $\n\nYou can also use `TypstDoc`, which automatically align to the top of the viewport,\ninstead of the center.\n''')\n\n\nclass TypstExample(Timeline):\n    CONFIG = Config(\n        typst_shared_preamble=t_(\n            R'''\n            #import \"@janim/colors:0.0.0\": *\n            #show raw: set text(BLUE)\n            ''')\n    )\n\n    def construct(self):\n        doc = TypstDoc(typst_doc)\n\n        group = Group(\n            Text('TypstText', color=BLUE),\n            TypstText('This is a sentence with a math expression $f(x)=x^2$'),\n            Text('TypstMath', color=BLUE),\n            TypstMath('sum_(i=1)^n x_i = x_1 + x_2 + dots.c + x_n')\n        )\n        group.points.arrange_in_grid()\n\n        # 作用于文本的动画的渲染速度较慢\n        self.play(Write(doc), duration=4)\n        self.forward()\n        self.play(FadeOut(doc))\n\n        self.play(Write(group))\n        self.forward()\n        self.play(FadeOut(group))\n"
  },
  {
    "id": "janim-colorize",
    "title": "TypstColorizeExample",
    "anchor": "typstcolorizeexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/TypstColorizeExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#typstcolorizeexample",
    "code": "from janim.imports import *\n\nclass TypstColorizeExample(Timeline):\n    def construct(self):\n        typ = TypstMath('cos^2 theta + sin^2 theta = 1', scale=3).show()\n\n        self.forward()\n        self.play(typ['cos'].anim.set(color=BLUE))\n        self.play(typ['sin'].anim.set(color=BLUE))\n        self.play(typ['theta', 0].anim.set(color=GOLD))\n        self.play(typ['theta', 1].anim.set(color=ORANGE))\n        self.forward()\n        self.play(typ['theta', ...].anim.set(color=GREEN))\n        self.play(typ['space^2', ...].anim.set(color=RED))\n        self.forward()\n"
  },
  {
    "id": "janim-pi",
    "title": "AnimatingPiExample",
    "anchor": "animatingpiexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/AnimatingPiExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#animatingpiexample",
    "code": "from janim.imports import *\n\nclass AnimatingPiExample(Timeline):\n    def construct(self):\n        grid = TypstMath('pi') * 100\n        grid.points.scale(2).arrange_in_grid(10, 10, buff=0.2)\n        grid.show()\n\n        self.play(grid.anim.points.shift(LEFT))\n        self.play(grid(VItem).anim.color.set(YELLOW))\n        self.forward()\n        self.play(grid(VItem).anim.color.set(BLUE))\n        self.forward()\n        self.play(grid.anim.points.to_center().set_height(TAU - MED_SMALL_BUFF))\n        self.forward()\n\n        self.play(grid.anim.points.apply_complex_fn(np.exp), duration=5)\n        self.forward()\n\n        self.play(\n            grid.anim.points.apply_point_fn(\n                lambda p: [\n                    p[0] + 0.5 * math.sin(p[1]),\n                    p[1] + 0.5 * math.sin(p[0]),\n                    p[2]\n                ]\n            ),\n            duration=5\n        )\n        self.forward()\n"
  },
  {
    "id": "janim-plane",
    "title": "NumberPlaneExample",
    "anchor": "numberplaneexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/NumberPlaneExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#numberplaneexample",
    "code": "from janim.imports import *\n\nclass NumberPlaneExample(Timeline):\n    def construct(self):\n        plane = NumberPlane(faded_line_ratio=1)\n\n        sin_graph = plane.get_graph(lambda x: math.sin(x))\n\n        self.forward(0.2)\n        self.play(Write(plane, lag_ratio=0.05))\n        self.play(Write(sin_graph))\n        self.forward()\n\n        self.play(\n            plane.anim.points.apply_matrix([\n                [3, -1],\n                [1, 2]\n            ]),\n            sin_graph.anim(),\n            duration=2\n        )\n        self.forward()\n"
  },
  {
    "id": "janim-updater",
    "title": "UpdaterExample",
    "anchor": "updaterexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/UpdaterExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#updaterexample",
    "code": "from janim.imports import *\n\nclass UpdaterExample(Timeline):\n    def construct(self):\n        square = Square(fill_color=BLUE_E, fill_alpha=1).show()\n        brace = Brace(square, UP).show()\n\n        def text_updater(p: UpdaterParams):\n            cmpt = brace.current().points\n            return cmpt.create_text(f'Width = {cmpt.brace_length:.2f}')\n\n        self.prepare(\n            DataUpdater(\n                brace,\n                lambda data, p: data.points.match(square.current())\n            ),\n            ItemUpdater(None, text_updater),\n            duration=10\n        )\n        self.forward()\n        self.play(square.anim.points.scale(2))\n        self.play(square.anim.points.scale(0.5))\n        self.play(square.anim.points.set_width(5, stretch=True))\n\n        w0 = square.points.box.width\n\n        self.play(\n            DataUpdater(\n                square,\n                lambda data, p: data.points.set_width(\n                    w0 + 0.5 * w0 * math.sin(p.alpha * p.range.duration)\n                )\n            ),\n            duration=5\n        )\n        self.forward()\n"
  },
  {
    "id": "janim-arrow",
    "title": "ArrowPointingExample",
    "anchor": "arrowpointingexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/ArrowPointingExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#arrowpointingexample",
    "code": "from janim.imports import *\n\nclass ArrowPointingExample(Timeline):\n    def construct(self):\n        dot1 = Dot(LEFT * 3)\n        dot2 = Dot()\n\n        arrow = Arrow(dot1, dot2, color=YELLOW)\n\n        self.show(dot1, dot2, arrow)\n        self.play(\n            dot2.update.points.rotate(TAU, about_point=RIGHT * 2),\n            GroupUpdater(\n                arrow,\n                lambda data, p:\n                    data.set_start_and_end(\n                        dot1.points.box.center,\n                        dot2.current().points.box.center\n                    )\n            ),\n            duration=4\n        )\n"
  },
  {
    "id": "janim-combine",
    "title": "CombineUpdatersExample",
    "anchor": "combineupdatersexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/CombineUpdatersExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#combineupdatersexample",
    "code": "from janim.imports import *\n\nclass CombineUpdatersExample(Timeline):\n    def construct(self):\n        square = Square()\n        square.points.to_border(LEFT)\n\n        # 这里每次 play 都多一个 Updater，用于演示 动画复合 的效果\n\n        self.play(\n            square.anim.points.to_border(RIGHT),\n            duration=2\n        )\n\n        ###############################\n\n        square.points.to_border(LEFT)\n        self.play(\n            square.anim.points.to_border(RIGHT),\n            DataUpdater(\n                square,\n                lambda data, p: data.points.shift(UP * math.sin(p.alpha * 4 * PI)),\n                become_at_end=False\n            ),\n            duration=2\n        )\n\n        ###############################\n\n        square.points.to_border(LEFT)\n        self.play(\n            square.anim.points.to_border(RIGHT),\n            DataUpdater(\n                square,\n                lambda data, p: data.points.shift(UP * math.sin(p.alpha * 4 * PI)),\n                become_at_end=False\n            ),\n            square.update(become_at_end=False).color.set(BLUE).r.points.rotate(-TAU),\n            duration=2\n        )\n"
  },
  {
    "id": "janim-pie",
    "title": "RotatingPieExample",
    "anchor": "rotatingpieexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/RotatingPieExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#rotatingpieexample",
    "code": "from janim.imports import *\n\nclass RotatingPieExample(Timeline):\n    def construct(self):\n        pie = Group(*[\n            Sector(start_angle=i * TAU / 4, angle=TAU / 4, radius=1.5, color=color, fill_alpha=1, stroke_alpha=0)\n                .points.shift(rotate_vector(UR * 0.05, i * TAU / 4))\n                .r\n            for i, color in enumerate([RED, PURPLE, MAROON, GOLD])\n        ])\n\n        self.play(\n            GroupUpdater(\n                pie,\n                lambda data, p: data.points.rotate(p.alpha * TAU, about_point=ORIGIN),\n                duration=5\n            ),\n            DataUpdater(\n                pie[0],\n                lambda data, p: data.points.shift(normalize(data.mark.get()) * p.alpha),\n                rate_func=there_and_back,\n                become_at_end=False,\n                at=2,\n                duration=2\n            )\n        )\n"
  },
  {
    "id": "janim-marked",
    "title": "MarkedItemExample",
    "anchor": "markeditemexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/MarkedItemExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#markeditemexample",
    "code": "from janim.imports import *\n\nclass MarkedSquare(MarkedItem, Square):\n    def __init__(self, side_length: float = 2.0, **kwargs):\n        super().__init__(side_length, **kwargs)\n        self.mark.set_points([RIGHT * side_length / 4, DOWN * side_length / 4])\n\n\nclass MarkedItemExample(Timeline):\n    def construct(self):\n        square = MarkedSquare()\n\n        tri1 = Triangle(radius=0.2, color=GREEN)\n        tri2 = Triangle(radius=0.2, color=BLUE)\n        dots = DotCloud(color=RED)\n\n        self.play(\n            square.update.points.rotate(TAU),\n            DataUpdater(\n                square,\n                lambda data, p: data.points.shift(RIGHT * math.sin(4 * math.pi * p.alpha))\n            ),\n\n            DataUpdater(\n                tri1,\n                lambda data, p: data.mark.set(square.current().mark.get())\n            ),\n            DataUpdater(\n                tri2,\n                lambda data, p: data.mark.set(square.current().mark.get(index=1))\n            ),\n            DataUpdater(\n                dots,\n                lambda data, p: data.points.set(square.current().mark.get_points()),\n                skip_null_items=False\n            ),\n            duration=4\n        )\n"
  },
  {
    "id": "janim-frame-effect",
    "title": "FrameEffectExample",
    "anchor": "frameeffectexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/FrameEffectExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#frameeffectexample",
    "code": "from janim.imports import *\n\nclass FrameEffectExample(Timeline):\n    def construct(self):\n        squares = Square(0.5, color=BLUE, fill_alpha=0.3) * 49\n        squares.points.arrange_in_grid()\n\n        effect1 = SimpleFrameEffect(    # (2~8s) [::2] 的方块产生渐变色\n            squares[::2],\n            shader='''\n            f_color = frame_texture(v_texcoord);\n            f_color.gb *= v_texcoord;\n            '''\n        )\n\n        effect2 = SimpleFrameEffect(    # (4~8s) [1::2] 的方块产生故障效果\n            squares[1::2],\n            shader='''\n            vec2 uv = v_texcoord;\n\n            float glitchStrength = sin(time) * 0.02;\n            vec2 offset = vec2(glitchStrength, 0.0);\n\n            float r = frame_texture(uv + offset).r;\n            float g = frame_texture(uv).g;\n            float b = frame_texture(uv - offset).b;\n            float a = max(frame_texture(uv + offset).a, max(frame_texture(uv).a, frame_texture(uv - offset).a));\n\n            float lineNoise = step(0.5, fract(uv.y * 10.0 + time));\n            r *= lineNoise;\n            b *= lineNoise;\n\n            f_color = vec4(r, g, b, a);\n            ''',\n            uniforms=['float time']\n        )\n\n\n        self.schedule(2, effect1.show)\n\n        self.play(\n            Rotate(squares, TAU, duration=8),\n            DataUpdater(\n                effect2,\n                lambda data, p: data.apply_uniforms(time=p.elapsed),\n                at=4,\n                duration=4\n            )\n        )\n"
  },
  {
    "id": "janim-3d-shapes",
    "title": "ThreeDShapesExample",
    "anchor": "threedshapesexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/ThreeDShapesExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#threedshapesexample",
    "code": "from janim.imports import *\n\nclass _ThreeDShapesExampleSub(Timeline):\n    def __init__(self, shape_type: str, background_color: JAnimColor):\n        super().__init__()\n        self.shape_type = shape_type\n        self.background_color = background_color\n\n    def construct(self):\n        if self.shape_type == 'smooth':\n            axes = ThreeDAxes((-8, 8), (-8, 8), (-8, 8)).apply_depth_test()\n            self.prepare(FadeIn(axes, at=1))\n\n        background = FrameRect(fill_alpha=1, fill_color=self.background_color, stroke_alpha=0, depth=100)\n        background.fix_in_frame()\n        self.prepare(FadeIn(background, at=1.5, duration=3))\n\n        for shape in [Torus(2, 1), Cylinder(2, 4), Cone(2, 4)]:\n            item = shape.into(self.shape_type).show()\n            self.play(self.RotatingCamera(), duration=4)\n            item.hide()\n        \n    def RotatingCamera(self):\n        return AnimGroup(\n            DataUpdater(\n                self.camera,\n                lambda data, p: data.points.rotate(TAU * p.alpha, axis=RIGHT),\n                rate_func=linear\n            ),\n            DataUpdater(\n                self.camera,\n                lambda data, p: data.points.rotate(TAU * p.alpha, axis=OUT),\n                rate_func=linear\n            ),\n        )\n\nclass ThreeDShapesExample(Timeline):\n    def construct(self):\n        subs = [\n            _ThreeDShapesExampleSub(type, color).build().to_item()\n            for type, color in zip(\n                ['checker', 'wire', 'smooth', 'dots'],\n                ['#000022', '#000033', '#000033', '#000022']\n            )\n        ]\n        subs[0].show()\n\n        effects = [\n            RectClip(sub, anchor=ORIGIN)\n            for sub in subs\n        ]\n        effects[0].show().depth.set(-1)\n        \n        dirs = [UL, UR, DL, DR]\n\n        self.forward()\n        for sub, effect, dir in zip(subs, effects, dirs):\n            self.show(sub, effect)\n            self.prepare(\n                effect.anim\n                    .points.scale(0.5).to_border(dir, buff=0)\n                    .r.transform.set(scale=0.5)\n            )\n\n        self.forward_to(subs[0].duration)\n"
  },
  {
    "id": "janim-mask",
    "title": "MaskExample",
    "anchor": "maskexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/MaskExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#maskexample",
    "code": "from janim.imports import *\n\nclass MaskExample(Timeline):\n    def construct(self):\n        ## 第一部分：文本在矩形遮罩中上浮的动画\n\n        txt = Text(\"Mask Example!\")\n        txt.points.scale(2).move_to(DOWN * 0.5)\n\n        # 创建一个位于文本上方的矩形遮罩\n        mask1_shape = Rect(txt.points.box.width, txt.points.box.height)\n        mask1_shape.points.next_to(txt, UP, buff=0.5)\n        mask1 = ShapeMask(txt, shape=mask1_shape).show()\n\n        # 文本逐个上浮\n        self.play(\n            *[\n                char.anim.points.shift(UP * (0.5 + txt.points.box.height))\n                for char in txt[0]\n            ],\n            lag_ratio=0.1,\n        )\n        self.forward()\n\n        ## 第二部分：遮罩与文字的变形\n\n        # 将遮罩变为圆形\n        mask2 = ShapeMask(txt, shape=Circle())\n        self.play(Transform(mask1, mask2))\n        self.forward()\n\n        # 遮罩的羽化\n        rect = Rect(3, 3, color=LIGHT_BROWN, fill_alpha=1, depth=10)\n        self.play(FadeIn(rect))\n        self.play(\n            mask2.anim.points.shift(UP * 0.5)\n                .r.feather.set(0.1),\n        )\n        self.play(\n            Succession(\n                txt.anim.points.shift(LEFT * 1),\n                txt.anim.points.shift(RIGHT * 1),\n            )\n        )\n        self.forward()\n\n        # 持有物件的变换\n        txt2 = Text(\"The mask should be hold\")\n        txt2.points.scale(2)\n        mask2.apply(txt2)\n        self.play(TransformMatchingDiff(txt, txt2))\n        self.forward()\n\n        # 遮罩本体的淡出\n        self.play(\n            FadeOut(rect),\n            FadeOut(mask2),\n        )\n        self.forward()\n        self.play(FadeOut(txt2))\n        self.forward()\n\n        ## 第三部分：遮罩与布尔运算\n\n        dot1 = Dot(LEFT, 1.5, color=YELLOW, fill_alpha=0.25).show()\n        dot2 = Dot(RIGHT, 1.5, color=YELLOW, fill_alpha=0.25).show()\n        txt3 = Text('Some Example Text Here', font_size=40).show()\n\n        # 使用 boolean_ops 创建遮罩的交并集\n        mask_union = ShapeMask(\n            txt3, \n            shape=boolean_ops.Union(dot1, dot2)\n        )\n        mask_intersection = ShapeMask(\n            txt3, \n            shape=boolean_ops.Intersection(dot1, dot2)\n        )\n        self.forward()\n        self.play(FadeIn(mask_union))\n        self.forward(0.5)\n        self.play(Transform(mask_union, mask_intersection), duration=0.5)\n        self.forward(0.5)\n        self.play(Transform(mask_intersection, mask_union), duration=0.5)\n        self.forward(0.5)\n        self.play(FadeOut(Group(dot1, dot2, txt3)))\n        self.forward()\n\n        ## 第四部分：复杂形状遮罩与特殊效果\n\n        # 复杂形状遮罩\n        txt_fashion = Text('Fashion')\n        txt_fashion.points.scale(10)\n        dots = DotCloud(\n            *[\n                [i * 0.3 + 0.15, j * 0.3, 0]\n                for j in range(20, -40, -1)\n                for i in range(-23, 23)\n            ], \n            radius=0.1,\n            color=PURPLE_E,\n        )\n        mask3 = ShapeMask(dots, shape=txt_fashion).show()\n\n        self.prepare(\n            dots.anim(rate_func=linear).points.shift(UP * 3),\n            duration=5.0,\n        )\n        self.play(FadeIn(dots))\n        self.forward(1.5)\n        self.play(mask3.anim.invert.set(1.0))\n        self.forward(1.5)\n"
  },
  {
    "id": "janim-balls",
    "title": "BallsCollisionExample",
    "anchor": "ballscollisionexample",
    "kind": "video",
    "mediaUrl": "https://janim.readthedocs.io/zh-cn/latest/_static/videos/BallsCollisionExample.mp4",
    "sourceUrl": "https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html#ballscollisionexample",
    "code": "from janim.imports import *\n\nclass Ball(Dot):\n    speed = CustomData()\n\n    def __init__(self, radius: float):\n        super().__init__(radius=radius, color=BLUE)\n        self.speed.set(ORIGIN)\n\nclass BallsCollisionExample(Timeline):\n    def construct(self):\n        # 有关配置\n        left = -4\n        right = 4\n        bottom = -3\n        top = 3\n\n        radius = 0.25\n        ball_count = 25\n\n        # 容器边框\n        Polygon([left, top, 0], [left, bottom, 0], [right, bottom, 0], [right, top, 0], fill_alpha=0.2).show()\n        # 内部的球\n        balls = Ball(radius) * ball_count\n\n        # 生成互不重叠的初始位置\n        positions = []\n        rng = np.random.default_rng(1234)\n        for ball in balls:\n            # 初始位置\n            while True:\n                pos = np.array([\n                    rng.uniform(left + radius, right - radius),\n                    rng.uniform(bottom + radius, top - radius),\n                    0,\n                ])\n                if all(np.linalg.norm(pos - other) >= 2 * radius for other in positions):\n                    break\n            ball.points.move_to(pos)\n            positions.append(pos)\n\n            # 初始速度\n            ball.speed.set(\n                np.array([\n                    rng.uniform(-3, 3),\n                    rng.uniform(-3, 3),\n                    0,\n                ])\n            )\n\n        def updater(group: Group[Ball], p) -> None:\n            dt = p.dt\n\n            # 1. 根据速度移动\n            for ball in group:\n                ball.points.shift(ball.speed.get() * dt)\n\n            # 2. 与容器边界碰撞\n            for ball in group:\n                pos = ball.points.box.center\n                speed = ball.speed.get().copy()\n\n                if pos[0] - radius < left:\n                    ball.points.set_x(left + radius)\n                    speed[0] = abs(speed[0])\n\n                elif pos[0] + radius > right:\n                    ball.points.set_x(right - radius)\n                    speed[0] = -abs(speed[0])\n\n                if pos[1] - radius < bottom:\n                    ball.points.set_y(bottom + radius)\n                    speed[1] = abs(speed[1])\n\n                elif pos[1] + radius > top:\n                    ball.points.set_y(top - radius)\n                    speed[1] = -abs(speed[1])\n\n                ball.speed.set(speed)\n\n            # 3. 小球之间的完全弹性碰撞\n            for i in range(len(group)):\n                for j in range(i + 1, len(group)):\n                    ball1 = group[i]\n                    ball2 = group[j]\n\n                    p1 = ball1.points.box.center\n                    p2 = ball2.points.box.center\n\n                    delta = p2 - p1\n                    dist = np.linalg.norm(delta)\n\n                    min_dist = 2 * radius\n\n                    if dist >= min_dist:\n                        continue\n\n                    # 两个球存在重合时，给出碰撞方向\n                    if dist < 1e-8:\n                        normal = np.array([1.0, 0.0, 0.0])\n                        dist = 0.0\n                    else:\n                        normal = delta / dist\n\n                    v1 = ball1.speed.get()\n                    v2 = ball2.speed.get()\n\n                    # 相对速度\n                    relative_velocity = v2 - v1\n                    velocity_along_normal = np.dot(relative_velocity, normal)\n                    # 只有相互靠近时才处理碰撞\n                    if velocity_along_normal < 0:\n                        # 相同质量的完全弹性碰撞\n                        impulse = velocity_along_normal * normal\n                        ball1.speed.set(v1 + impulse)\n                        ball2.speed.set(v2 - impulse)\n\n                    # 消除两个球之间的重叠\n                    overlap = min_dist - dist\n                    if overlap > 0:\n                        correction = normal * (overlap / 2)\n                        ball1.points.shift(-correction)\n                        ball2.points.shift(correction)\n\n        self.play(\n            GroupStepUpdater(balls, updater),\n            duration=4,\n        )\n\n        ball_follow = balls[6]\n\n        self.forward(0.5)\n        self.play(\n            self.camera.anim.points.scale(0.5).move_to(ball_follow),\n            ball_follow.anim.set(color=YELLOW),\n        )\n        self.forward(0.5)\n        self.play(\n            GroupStepUpdater(balls, updater),\n            Follow(self.camera, ball_follow, ORIGIN),\n            duration=6,\n        )\n"
  }
]
