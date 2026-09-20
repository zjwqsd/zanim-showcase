const code = {
  hello: {
    python: `from zanim import BLUE, Canvas, Circle, Scene

scene = Scene(canvas=Canvas(1280, 720, 90), fps=60)
circle = scene.add(Circle(1, fill=BLUE))

circle.move(to=(2, 0), duration=2)
circle.rotate(by=1.2, duration=0.8)

scene.preview()`,
    js: `import { BLUE, Circle, Scene } from '@zanim/web'

const scene = await Scene.create('#canvas', {
  renderer: { unitSize: 90 },
})

const circle = scene.add(new Circle(1, { fill: BLUE }))
scene.move(circle, [2, 0], { duration: 2 })
scene.rotate(circle, 1.2, { duration: 0.8 })

scene.play()`,
  },

  classFrontend: {
    python: `from zanim import BLUE, WORLD, Circle, Row, Scene, Square

class Demo(Scene):
    def setup(self):
        self.square = Square(1)
        self.circle = Circle(0.6, fill=BLUE)
        Row(gap=0.5).place(self.square, self.circle)

    def construct(self):
        square, circle = self.add(self.square, self.circle)
        with self.parallel(duration=1):
            square.move(by=(-1, 0), frame=WORLD)
            circle.move(by=(1, 0), frame=WORLD)`,
    js: '',
  },

  parallel: {
    python: `with scene.parallel(duration=1.2):
    square.move(by=(2, 0))
    circle.rotate(by=PI)
    label.fade_in(at=0.25)

scene.wait(0.3)`,
    js: `scene.parallel(1.2, (api) => {
  api.move(square, [2, 0])
  api.rotate(circle, PI)
  api.fadeIn(label, { at: 0.25 })
})

scene.wait(0.3)`,
  },

  frames: {
    python: `tool.move(by=(1.5, 0), frame=LOCAL)
tool.move(by=(1.5, 0), frame=PARENT)
tool.move(by=(1.5, 0), frame=WORLD)`,
    js: `scene.move(tool, [1.5, 0], { frame: LOCAL })
scene.move(tool, [1.5, 0], { frame: PARENT })
scene.move(tool, [1.5, 0], { frame: WORLD })`,
  },

  layout: {
    python: `square = Square(1)
circle = Circle(0.55)
card = Rectangle(1.4, 0.8)

Row(gap=0.5).place(square, circle, card)
square, circle, card = scene.add(square, circle, card)

scene.layout(
    square, circle, card,
    to=Grid(rows=2, cols=2, gap=0.4),
    duration=0.8,
)`,
    js: `const square = new Square(1)
const circle = new Circle(.55)
const card = new Rectangle(1.4, .8)

new Row({ gap: .5 }).place(square, circle, card)
scene.add(square, circle, card)

scene.layout(square, circle, card, {
  to: new Grid({ rows: 2, cols: 2, gap: .4 }),
  duration: .8,
})`,
  },

  values: {
    python: `progress = ScalarValue(0)
number = DynamicNumber(progress, digits=1)

progress, number = scene.add(progress, number)
progress.value(to=100, duration=2)`,
    js: `const progress = new ScalarValue(0)
scene.addValue(progress)

const number = new DynamicNumber(progress, { digits: 1 })
scene.add(number)
scene.animateValue(progress, { to: 100, duration: 2 })`,
  },

  dynamic: {
    python: `field = DynamicBatchObject2D(
    lambda t: sample_field(t),
)
scene.add(field)
scene.wait(6)`,
    js: `const field = new DynamicLineSet(
  (time) => sampleField(time),
  { worldStroke: true },
)

scene.add(field)
scene.wait(6)`,
  },

  threeD: {
    python: `camera = Camera3D(
    position=Vec3(6, 4, 7),
    target=Vec3(),
)

scene = Scene(canvas=Canvas(1280, 720, 90), camera3d=camera)
cube = scene.add(Cube3D(size=1.5, color=BLUE))

cube.transform_function(
    lambda a: Transform3D.rotation_y(TAU * a),
    duration=5,
)`,
    js: `const camera = new Camera3D({
  position: new Vec3(6, 4, 7),
  target: new Vec3(),
})

const cube = Box3D(new Vec3(1.5, 1.5, 1.5), {
  color: BLUE,
  transform: (t) => Transform3D.rotationY(t),
})

scene.add(new Scene3DLayer([cube], { camera }))
scene.wait(5)`,
  },

  web: {
    python: `# Python 侧：创作、Preview、Native Render、导出 IR
scene = Scene(canvas=Canvas(1280, 720, 90), fps=60)
# ...
scene.preview()`,
    js: `// Web 侧：同样是 retained Scene，不是 Python 视频播放器
const scene = await Scene.create(canvas)
scene.add(/* ... */)

scene.play()
scene.pause()
scene.seek(2.75)`,
  },

  ir: {
    python: `from zanim import scene_to_ir, write_scene_ir

ir = scene_to_ir(scene)
write_scene_ir(ir, "scene.zanim.json")`,
    js: `import { sceneToIR } from '@zanim/web/ir'

const ir = sceneToIR(scene)
const json = JSON.stringify(ir, null, 2)`,
  },
}

export const navGroups = [
  {
    title: '开始',
    items: [
      ['/', 'Zanim 文档'],
      ['/installation', '安装'],
      ['/gallery', 'Example Gallery'],
    ],
  },
  {
    title: '教程与指南',
    items: [
      ['/tutorial/quickstart', '快速入门'],
      ['/tutorial/building-blocks', '对象、Group 与 Scene'],
      ['/tutorial/timeline', '时间轴'],
      ['/tutorial/transforms', '变换与坐标系'],
      ['/tutorial/layout', '布局'],
      ['/tutorial/text-math-media', 'Text、Math 与 Media'],
      ['/tutorial/dynamic', '动态对象、Batch 与 Simulation'],
      ['/tutorial/three-d', '3D'],
      ['/tutorial/web', 'Web Runtime'],
      ['/tutorial/scene-ir', 'Scene IR'],
    ],
  },
  {
    title: '更多',
    items: [
      ['/janim', 'JAnim 致谢与参考'],
      ['/reference', '紧凑参考'],
      ['https://github.com/zjwqsd/zanim', 'Zanim GitHub ↗'],
      ['https://github.com/zjwqsd/zanim-showcase', 'Showcase GitHub ↗'],
    ],
  },
]

export const pages = {
  '/': {
    title: 'Zanim 文档',
    lead: 'Zanim 是以 retained state、显式生命周期与绝对时间为核心的动画引擎。Python 与 Web 使用同一套 Scene 心智模型，分别面向本地创作/渲染与浏览器运行。',
    sections: [
      {
        id: 'mental-model',
        title: '先记住三个概念',
        bullets: [
          'Object：声明几何、样式与初始 transform。',
          'Scene.add()：明确的所有权与生命周期边界；对象从这里进入 Scene。',
          'Timeline：后续 move / rotate / style / value 等操作写成可随机访问的绝对时间状态。',
        ],
        scene: 'basics',
      },
      {
        id: 'first-scene',
        title: '最小可运行场景',
        paragraphs: [
          '脚本式写法适合快速实验，也是官方推荐入口之一。对象创建、add、动画与 preview 可以直接写在模块顶层。',
        ],
        code: code.hello,
      },
      {
        id: 'routes',
        title: '按目标阅读',
        bullets: [
          '第一次写动画：快速入门 → 对象、Group 与 Scene → 时间轴。',
          '做数学/教学可视化：布局 → Text/Math → 动态对象。',
          '做机器人、层级坐标或空间动画：变换与坐标系 → 3D。',
          '做网页交互：Web Runtime → Scene IR。',
          '直接看能力范围：Example Gallery 的 Zanim / Manim / JAnim 三个集合。',
        ],
        links: [['/gallery', '打开 Example Gallery']],
      },
    ],
  },

  '/installation': {
    title: '安装',
    lead: 'Python 与 Web runtime 可独立安装。只做 Python 创作不需要 Web；只做网页场景也不需要 Python runtime。',
    sections: [
      {
        id: 'python',
        title: 'Python',
        shell: 'pip install --pre zanim==0.7.0rc1',
        bullets: [
          'Python 3.12+。',
          'FFmpeg 仅在编码视频时需要。',
          'Text / Math 使用 Typst；纯几何场景不依赖 Typst。',
        ],
      },
      {
        id: 'cli',
        title: '常用命令',
        shell: 'zanim preview scene.py\nzanim render scene.py -o scene.mp4\nzanim render scene.py --time 1.25 -o frame.png\nzanim info',
        paragraphs: [
          'preview 与 render 都读取同一个 Scene 定义。随机访问某一帧不需要先播放前面的时间。',
        ],
      },
      {
        id: 'web',
        title: 'Web',
        shell: 'npm install @zanim/web@beta',
        paragraphs: [
          'Vite 项目建议启用 @zanim/web/vite。它负责 WASM 资源与构建期 Typst/Math 编译；生产浏览器只加载编译后的矢量资源。',
        ],
        code: {
          python: '',
          js: `// vite.config.js
import { defineConfig } from 'vite'
import { zanim } from '@zanim/web/vite'

export default defineConfig({
  plugins: [zanim()],
})`,
        },
      },
    ],
  },

  '/tutorial/quickstart': {
    title: '快速入门',
    lead: '先区分“Scene 里有什么”和“Scene 随时间怎么变”。Zanim 允许完全静态的 Scene；只有需要变化时才编写时间线。',
    sections: [
      {
        id: 'static-scene',
        title: '1. 最小 Scene：只有状态，没有时间线',
        paragraphs: [
          '创建对象并 add() 就已经是完整场景。静态图、结构图、论文配图和公式页都不需要为了“像动画框架”而加入 wait() 或播放控制。',
        ],
        bullets: [
          '对象先声明几何、样式和初始 transform。',
          'Scene.add() 让对象进入 Scene 生命周期。',
          '没有动画 clip 时，任意时间看到的都是同一个状态。',
        ],
        demo: 'tutorial-objects-static',
      },
      {
        id: 'first-animation',
        title: '2. 再加入时间行为',
        paragraphs: [
          '动画只描述状态如何随时间改变。下面只有一个 Square：先平移，再旋转，再缩放，因此代码和画面可以逐行对应。',
        ],
        demo: 'tutorial-first-animation',
      },
      {
        id: 'authoring-style',
        title: '3. 两种 Python 创作入口',
        paragraphs: [
          '顶层脚本式写法适合小型实验和快速验证；Scene 子类适合把 setup() 与 construct() 分开组织。两者最终写入同一个 Scene 模型。',
        ],
        table: [
          ['脚本式', 'scene = Scene(); scene.add(...); scene.preview()'],
          ['Scene 子类', 'setup() 声明初始状态；construct() 编排时间行为'],
          ['共同点', 'add() 是生命周期边界；时间轴语义相同'],
        ],
      },
    ],
  },

  '/tutorial/building-blocks': {
    title: '对象、Group 与 Scene',
    lead: '对象保存局部状态，Group 保存层级关系，Scene 保存生命周期与随时间变化的 authored state。',
    sections: [
      {
        id: 'group',
        title: 'Group：先把结构表达清楚',
        paragraphs: [
          '父 Group 的 transform 影响整棵子树；子对象仍保留自己的局部 transform。机器人关节、复杂图标和组合标注都适合这样表示。',
        ],
        demo: 'tutorial-group-static',
      },
      {
        id: 'lifecycle',
        title: 'Scene.add() 与生命周期',
        paragraphs: [
          '对象可以一开始就存在，也可以先以 opacity=0 加入后再 fade_in；还可以在时间线推进后才 add()。remove() 明确结束后续可见性。',
        ],
        demo: 'tutorial-lifecycle',
      },
      {
        id: 'state-model',
        title: '三种容易混淆的状态',
        table: [
          ['Raw object', 'add() 前的声明态；适合一次性布局和初始配置'],
          ['Authored head', '创作光标当前位置的 Scene-owned 状态；后续相对操作以它为基准'],
          ['Evaluated state', '给定任意时间 t 后真正用于渲染的状态'],
        ],
      },
    ],
  },

  '/tutorial/timeline': {
    title: '时间轴',
    lead: '时间轴只解决“什么时候发生什么”。顺序、并行、局部偏移和随机访问都建立在同一条绝对时间线上。',
    sections: [
      {
        id: 'sequence',
        title: '顺序：默认推进 cursor',
        paragraphs: [
          '连续写动画时，后一段默认从前一段结束处开始。这个例子只有一个点，先移动两次，再缩放。',
        ],
        demo: 'tutorial-sequence',
      },
      {
        id: 'parallel',
        title: '并行：共享 scheduling base',
        paragraphs: [
          'parallel() 内的操作从同一时刻出发；at 只表示并行区间中的局部偏移。下面 Square 平移，Circle 延迟一点开始缩放。',
        ],
        demo: 'tutorial-parallel',
      },
      {
        id: 'rules',
        title: '时间线的几个规则',
        bullets: [
          'wait(dt) 只推进创作时间，不改变对象状态。',
          '同一个对象的同一个动画 channel 不允许重叠写入，冲突会显式报错。',
          'Preview seek、单帧 render 和完整视频渲染都直接求值绝对时间，不依赖从 0 秒重放。',
          '持续程序化变化优先使用 provider / ScalarValue / Simulation，而不是上一帧累加 delta。',
        ],
      },
    ],
  },

  '/tutorial/transforms': {
    title: '变换与坐标系',
    lead: 'LOCAL / PARENT / WORLD 决定“相对位移和旋转”在哪个坐标基底中解释。层级对象越复杂，这个区别越重要。',
    sections: [
      {
        id: 'frames',
        title: '先静态看三个 frame',
        paragraphs: [
          '下面三个面板没有时间线，只展示同一个局部坐标架在 LOCAL、PARENT、WORLD 语义下的参照关系。',
        ],
        demo: 'tutorial-frames-static',
      },
      {
        id: 'motion',
        title: '再看实际运动',
        paragraphs: [
          '父 Group 本身带旋转，但 WORLD 平移仍沿世界坐标解释；随后再对整个 Group 做旋转。',
        ],
        demo: 'tutorial-frame-motion',
      },
      {
        id: 'choice',
        title: '如何选择',
        table: [
          ['LOCAL', '沿对象自己的轴运动；工具末端、局部推进'],
          ['PARENT', '沿父节点坐标轴运动；关节链和局部组件'],
          ['WORLD', '沿场景世界坐标运动；全局定位、相机对齐'],
        ],
      },
    ],
  },

  '/tutorial/layout': {
    title: '布局',
    lead: '布局是“算出一组目标位置”，不是持续约束系统。最常见的两种用法是 add() 前静态排版，以及 add() 后动画到新的布局。',
    sections: [
      {
        id: 'static-layout',
        title: '静态布局：Row / Column / Grid',
        paragraphs: [
          'place() 在对象进入 Scene 前直接写初始 transform，非常适合卡片、图例、公式组件和界面式排版。',
        ],
        demo: 'tutorial-layout-static',
      },
      {
        id: 'animated-layout',
        title: '布局也可以成为动画目标',
        paragraphs: [
          '同一组对象从 Row 过渡到 Grid，再回到 Row；对象本身没有被复制，也没有持续 layout constraint。',
        ],
        demo: 'tutorial-layout-transition',
      },
      {
        id: 'layout-choice',
        title: '常用选择',
        table: [
          ['初始排版', 'Row.place · Column.place · Grid.place'],
          ['排版过渡', 'Scene.layout(...)'],
          ['整体层级运动', 'Group'],
          ['大量同类图元', 'CircleSet · LineSet · RectSet'],
        ],
      },
    ],
  },

  '/tutorial/text-math-media': {
    title: 'Text、Math 与 Media',
    lead: 'Text 适合普通文字；Math/Typst 负责真正的公式矢量排版；Image、GIF、Video 则作为媒体对象进入同一个 Scene。',
    sections: [
      {
        id: 'math',
        title: 'Math：真正的 Typst 矢量公式',
        paragraphs: [
          '公式不是 Canvas 文本拼出来的。矩阵、积分、上下标等由 Typst 编译成矢量文档，再由 Zanim 渲染。下面是纯静态 Scene，没有时间线。',
        ],
        demo: 'tutorial-math-static',
      },
      {
        id: 'text',
        title: 'Text 与 Math 的分工',
        bullets: [
          'Text：标题、注释、短标签、UI 风格文本。',
          'Math：公式、矩阵、复杂数学排版；优先保留矢量结构。',
          '高频变化的数字不要每帧重新编译 Typst，使用 DynamicNumber / FormulaTemplate。',
        ],
      },
      {
        id: 'media',
        title: 'Image / GIF / Video',
        paragraphs: [
          '媒体对象仍受 Scene 生命周期和时间控制。Video 默认静音；带 Audio 的 Gallery 示例也默认静音，只有用户主动开启声音后才播放。',
        ],
        demo: 'tutorial-media',
      },
    ],
  },

  '/tutorial/dynamic': {
    title: '动态对象、Batch 与 Simulation',
    lead: '当画面由少量状态或一个纯时间函数决定时，直接表达“状态源 → 几何”，比每帧创建/删除对象更清楚。',
    sections: [
      {
        id: 'scalar',
        title: 'ScalarValue：一个可动画的状态源',
        paragraphs: [
          'ScalarValue 进入 Scene 后可以像普通动画 channel 一样被插值；DynamicNumber 等对象直接读取它。',
        ],
        demo: 'tutorial-scalar-value',
      },
      {
        id: 'batch',
        title: 'Batch：大量 primitive 仍然可以是静态 Scene',
        paragraphs: [
          '105 个圆没有 105 个独立 Scene object，而是一个 CircleSet。点云、网络节点、稠密线段和算法状态都适合 batch。',
        ],
        demo: 'tutorial-batch-static',
      },
      {
        id: 'provider',
        title: 'Provider：直接写成 time → state',
        paragraphs: [
          '这个例子没有一串 move clip。线场和移动点都由绝对时间直接求值，因此 seek 到任意时刻都能得到确定结果。',
        ],
        demo: 'tutorial-provider',
      },
      {
        id: 'simulation',
        title: '什么时候用 Simulation',
        bullets: [
          '纯函数能表达：优先 provider。',
          '少量连续标量状态：优先 ScalarValue。',
          '真正逐步演化的物理/算法状态：使用固定步长 Simulation，并通过 checkpoint 或采样支持 seek。',
        ],
        links: [['/gallery#collisions', '查看弹性碰撞示例']],
      },
    ],
  },

  '/tutorial/three-d': {
    title: '3D',
    lead: '3D 不需要单独的“动画世界”。Mesh、Camera3D 与 2D overlay 都属于同一个 Scene，只是渲染层不同。',
    sections: [
      {
        id: 'static-3d',
        title: '静态 3D 也是完整 Scene',
        paragraphs: [
          '两个 MeshObject3D 加一个 Camera3D 就足够形成完整 3D 场景，没有任何时间线。',
        ],
        demo: 'tutorial-3d-static',
      },
      {
        id: 'motion-3d',
        title: '3D transform 同样由绝对时间驱动',
        paragraphs: [
          '旋转 cube 的 transform 是时间函数，因此播放和 seek 共享同一个结果。',
        ],
        demo: 'tutorial-3d-motion',
      },
      {
        id: 'stack',
        title: '3D 栈',
        table: [
          ['MeshObject3D', '网格、颜色、局部 Transform3D'],
          ['Camera3D', 'position · target · fov'],
          ['Scene3DLayer', 'Web 端 3D 深度渲染层'],
          ['2D overlay', 'Text / Math / UI 可与 3D 同时存在'],
        ],
      },
    ],
  },

  '/tutorial/web': {
    title: 'Web Runtime',
    lead: '@zanim/web 在浏览器中直接运行 retained Scene。它不是 Python 渲染结果的视频播放器。',
    sections: [
      {
        id: 'same-model',
        title: '同一套 Scene 心智模型',
        paragraphs: [
          'Web 仍然是 create object → scene.add() → authored timeline → play/pause/seek。Gallery 的播放条是在控制真实 Scene 时间。',
        ],
        demo: 'tutorial-first-animation',
      },
      {
        id: 'interaction',
        title: '交互可以直接修改 retained state',
        paragraphs: [
          '下面的无穷平面没有预先录制时间线。拖拽基向量、选择矩阵、缩放与平移都会直接更新 Scene retained state。',
        ],
        scene: 'interactive-linear',
      },
      {
        id: 'build',
        title: '构建期与运行时分工',
        bullets: [
          'Math / Typst：Vite 构建阶段编译成 SVG，生产浏览器只加载矢量资源。',
          'WASM：负责需要 native 性能的几何/栅格能力。',
          '复杂 Gallery：进入视口再创建 Scene，离开视口暂停。',
          '交互 Scene：可以没有 authored timeline，直接由用户输入改变 retained state。',
        ],
      },
    ],
  },

  '/tutorial/scene-ir': {
    title: 'Scene IR',
    lead: 'Scene IR 是跨 runtime 的显式边界：能移植的状态写进 IR，任意 callback 和外部系统状态不会被假装成通用数据。',
    sections: [
      {
        id: 'boundary',
        title: '先看边界',
        paragraphs: [
          'Python Scene 可以导出可移植状态，Web 端再重建对应 Scene。这个关系本身是结构，不需要动画。',
        ],
        demo: 'tutorial-ir-static',
      },
      {
        id: 'export',
        title: '导出与读取',
        code: code.ir,
      },
      {
        id: 'portable',
        title: '适合进入 IR 的内容',
        bullets: [
          '对象几何、样式、transform 与生命周期。',
          '矢量文档与资源引用。',
          '支持的 timeline clip 与 value 状态。',
          '明确可表达的 2D / 3D Scene 状态。',
        ],
      },
      {
        id: 'limits',
        title: '不应隐式跨边界的内容',
        paragraphs: [
          '任意 Python closure、设备句柄、系统调用或第三方 runtime 对象应显式失败、采样为数据，或改写成 IR 能表达的结构。',
        ],
      },
    ],
  },

  '/janim': {
    title: 'JAnim 致谢与参考',
    lead: 'Zanim 的部分 API 设计、效果验证与示例组织曾参考 JAnim。Showcase 保留独立 JAnim 集合，用 Zanim 自己的公开 API 重新表达这些效果。',
    sections: [
      {
        id: 'thanks',
        title: '感谢 JAnim',
        paragraphs: [
          '感谢 JAnim 项目在动画 API、效果设计和示例组织方面给 Zanim 提供的参考与启发。',
          '这些场景用于效果与能力验证，不构成 JAnim API 兼容层。',
        ],
        links: [
          ['/gallery#collection-janim', '查看 JAnim 集合'],
          ['https://github.com/jkjkil4/JAnim', 'JAnim 项目 ↗'],
        ],
      },
      {
        id: 'coverage',
        title: '当前覆盖',
        bullets: [
          '基础动画、Text、Typst、Number Plane。',
          'Updater、Arrow、Pie、Marked Item。',
          'Frame Effect、Mask。',
          'Torus / Cylinder / Cone 3D shapes。',
        ],
        scene: 'janim-pi',
      },
    ],
  },

  '/reference': {
    title: '紧凑参考',
    lead: '这里只保留需要形成记忆索引的核心名字；具体参数直接结合类型提示与 Gallery 源码查看。',
    sections: [
      {
        id: 'objects',
        title: '对象',
        table: [
          ['2D', 'Circle · Square · Rectangle · Polygon · Polyline · Line · Arrow · Group'],
          ['批量', 'CircleSet · LineSet · RectSet · DynamicCircleSet · DynamicLineSet'],
          ['数学', 'Axes · InfiniteGrid · InfiniteLine · FunctionPlot · DynamicNumber · Math'],
          ['资源', 'Text · VectorObject2D · Image · GIF · Video · Audio'],
          ['3D', 'Camera3D · MeshObject3D · Box3D · Scene3DLayer · Transform3D'],
        ],
      },
      {
        id: 'timeline',
        title: '时间轴',
        table: [
          ['结构', 'add · remove · wait · at · parallel'],
          ['变换', 'move · rotate · scale · affine · transform_function'],
          ['出现/消失', 'fade_in · fade_out · create'],
          ['数值', 'ScalarValue · value'],
          ['布局', 'Row · Column · Grid · Scene.layout'],
        ],
      },
      {
        id: 'spaces',
        title: '空间与 runtime',
        table: [
          ['坐标帧', 'LOCAL · PARENT · WORLD'],
          ['2D', 'Transform2D · Vec2'],
          ['3D', 'Transform3D · Vec3 · Camera3D'],
          ['跨 runtime', 'Scene IR'],
          ['Web', '@zanim/web · @zanim/web/vite'],
        ],
      },
    ],
  },
}

export function pageFor(path) {
  return pages[path] ?? pages['/']
}
