const code = {
  hello: {
    python: `from zanim import BLUE, Circle, Scene

scene = Scene()
circle = scene.add(Circle(1, fill=BLUE))
circle.move(by=(2, 0), duration=1.5)
circle.rotate(by=1.2, duration=0.8)
scene.preview()`,
    js: `import { BLUE, Circle, Scene } from '@zanim/web'

const scene = await Scene.create('#canvas')
const circle = scene.add(new Circle(1, { fill: BLUE }))
scene.move(circle, [2, 0], { duration: 1.5 })
scene.rotate(circle, 1.2, { duration: 0.8 })
scene.play()`,
  },
  parallel: {
    python: `with scene.parallel(duration=1.2):
    square.move(by=(2, 0))
    circle.rotate(by=PI)
    label.fade_in(at=0.25)

scene.wait(0.3)`,
    js: `scene.parallel(1.2, api => {
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
    python: `items = scene.add(Square(1), Circle(.55), Rectangle(1.4, .8))

scene.layout(*items, to=Row(gap=.5), duration=.8)
scene.layout(*items, to=Grid(rows=2, cols=2, gap=.4), duration=.8)`,
    js: `const items = scene.add(
  new Square(1),
  new Circle(.55),
  new Rectangle(1.4, .8),
)

scene.layout(...items, { to: new Row({ gap: .5 }), duration: .8 })
scene.layout(...items, { to: new Grid({ rows: 2, cols: 2, gap: .4 }), duration: .8 })`,
  },
  math: {
    python: `formula = scene.add(Math(r"\\int_a^b f(x)\\,dx"))
progress = scene.add_value(ScalarValue(0))

number = scene.add(
    DynamicNumber(progress, digits=2)
)
progress.animate(to=1, duration=2)`,
    js: `const formula = scene.add(new Math('\\int_a^b f(x)\\,dx'))
const progress = scene.addValue(new ScalarValue(0))

const number = scene.add(new DynamicNumber(progress, { digits: 2 }))
scene.animateValue(progress, { to: 1, duration: 2 })`,
  },
  dynamic: {
    python: `field = DynamicVectorField(
    electric_field,
    x_range=(-5, 5),
    y_range=(-3, 3),
    step=.5,
)
field = scene.add(field)
scene.wait(6)`,
    js: `const field = new DynamicLineSet(time => sampleField(time), {
  worldStroke: true,
})
scene.add(field)
scene.wait(6)`,
  },
  threeD: {
    python: `scene = Scene(camera3d=Camera3D(
    position=Vec3(6, 4, 7),
    target=Vec3(),
))

cube = scene.add(Box3D(Vec3(1.5, 1.5, 1.5), color=BLUE))
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
  transform: t => Transform3D.rotationY(t),
})

scene.add(new Scene3DLayer([cube], { camera }))
scene.wait(5)`,
  },
  web: {
    python: `# Python 负责创作、预览、原生渲染或导出 Scene IR
from zanim import Scene

scene = Scene()
# ...
scene.preview()`,
    js: `import { Scene } from '@zanim/web'

const scene = await Scene.create(canvas)
scene.add(/* ... */)

// 可以播放，也可以直接随机访问
scene.play()
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
      ['/tutorial/building-blocks', 'Zanim 的基础构件'],
      ['/tutorial/timeline', 'Scene 与时间轴'],
      ['/tutorial/transforms', '变换与坐标系'],
      ['/tutorial/layout', '布局与组合'],
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
    lead: 'Zanim 是一个以“状态 + 绝对时间”为核心的动画引擎。Python 用于创作与原生渲染，Web runtime 用于浏览器交互；两者共享同一套 Scene 心智模型。',
    sections: [
      {
        id: 'first-steps',
        title: '第一步',
        paragraphs: [
          '如果你第一次使用 Zanim，先完成安装，然后看“快速入门”。核心 API 不多：创建对象、add 到 Scene、在时间轴上修改状态、最后 preview / render。',
          '与需要从第 0 帧重放的动画系统不同，Zanim 的目标是让任意时间 t 都能直接求出场景状态，因此 preview seek、单帧渲染和视频渲染使用同一时间模型。',
        ],
        links: [
          ['/installation', '安装 Zanim'],
          ['/tutorial/quickstart', '快速入门'],
          ['/gallery', '浏览 Example Gallery'],
        ],
        code: code.hello,
        scene: 'basics',
      },
      {
        id: 'where-next',
        title: '接下来读什么？',
        bullets: [
          '想写动画：基础构件 → Scene 与时间轴 → 变换与坐标系。',
          '想做数学可视化：布局 → Text/Math → 动态对象。',
          '想做浏览器交互：Web Runtime。',
          '想理解 Python / Web 如何互通：Scene IR。',
          '想直接看能力上限：Example Gallery。',
        ],
      },
    ],
  },

  '/installation': {
    title: '安装',
    lead: 'Python 包和 Web 包可以独立使用；如果同时做原生渲染与浏览器展示，建议两边都安装。',
    sections: [
      {
        id: 'python',
        title: 'Python',
        paragraphs: ['当前公开版本是 pre-1.0 release candidate。发布 wheel 已包含 Zig native renderer。'],
        shell: 'pip install --pre zanim==0.7.0rc1',
        bullets: [
          'Python 3.12+。',
          'FFmpeg 仅在编码 MP4 等视频时需要。',
          'Typst 仅在创作 Text / Math 时需要；纯几何场景不依赖它。',
        ],
      },
      {
        id: 'web',
        title: 'JavaScript / Web',
        paragraphs: ['浏览器 runtime 发布在 npm 的 @zanim/web。Vite 项目建议同时启用官方 plugin，它会处理 WASM URL 和静态 Typst/Math 资源。'],
        shell: 'npm install @zanim/web@beta',
        code: {
          python: '# Python 与 Web 可以独立安装；这里无需 Python 代码。',
          js: `// vite.config.js
import { defineConfig } from 'vite'
import { zanim } from '@zanim/web/vite'

export default defineConfig({
  plugins: [zanim()],
})`,
        },
      },
      {
        id: 'verify',
        title: '验证安装',
        shell: 'zanim --version\nzanim info',
        paragraphs: ['如果要确认 Web runtime，创建一个空 canvas 后运行 Scene.create()；WASM 成功加载即可。'],
      },
    ],
  },

  '/tutorial/quickstart': {
    title: '快速入门',
    lead: '一个 Zanim 场景只有四步：声明对象 → add → 编排时间 → preview / render。',
    sections: [
      {
        id: 'first-scene',
        title: '第一个场景',
        paragraphs: [
          '对象在 add() 之前只是普通声明值。add() 是明确的所有权边界：之后对象的 authored state 由 Scene 管理。',
          '后续 move / rotate / scale 等操作不是立即把画面改掉，而是把新的状态变化写入 Scene 时间轴。',
        ],
        code: code.hello,
        scene: 'basics',
      },
      {
        id: 'render',
        title: 'Preview 与 Render',
        bullets: [
          'preview()：交互预览，可直接 seek。',
          'render(time=t)：只求某一帧。',
          'render(start=a, end=b)：渲染时间区间。',
          'render_video(...)：编码视频；这是输出方式，不改变 Scene 模型。',
        ],
      },
    ],
  },

  '/tutorial/building-blocks': {
    title: 'Zanim 的基础构件',
    lead: '先理解 Object、Group、Scene 和资源，再去记具体动画方法。',
    sections: [
      {
        id: 'objects',
        title: 'Object：声明“是什么”',
        paragraphs: ['Circle、Square、Line、Text、Math、Image、3D mesh 等对象保存几何、样式与基础 transform。对象本身不需要知道整条时间轴。'],
        scene: 'state',
      },
      {
        id: 'group',
        title: 'Group：建立层级',
        paragraphs: ['Group 用于把对象组成局部坐标层级。对子组做 PARENT / LOCAL 变换时，子对象的结构关系保持清楚。'],
        bullets: ['用 Group 表达结构，不要把所有坐标预先烘焙成 WORLD。', '需要大量同类 primitive 时优先 CircleSet / LineSet，而不是数百个独立对象。'],
      },
      {
        id: 'scene',
        title: 'Scene：拥有时间与生命周期',
        paragraphs: ['Scene 记录 initial state、authored head、timeline clips 和对象 birth/death。随机访问时由这些信息直接重建 t 时刻状态。'],
        scene: 'basics',
      },
    ],
  },

  '/tutorial/timeline': {
    title: 'Scene 与时间轴',
    lead: 'Zanim 默认顺序执行；并行需要显式 parallel()。这种写法让时间关系直接体现在代码结构里。',
    sections: [
      {
        id: 'sequential-parallel',
        title: '顺序与并行',
        code: code.parallel,
        scene: 'timeline',
      },
      {
        id: 'offset',
        title: 'Offset、wait 与 authored head',
        paragraphs: [
          'Scene cursor 表示当前创作位置。普通操作推进 cursor；parallel() 中的操作共享同一个 scheduling base；at 用于在该 span 内增加局部偏移。',
          '不要把并行理解成线程。它只是时间轴上的多个 clip 同时覆盖某个时间区间。',
        ],
      },
      {
        id: 'random-access',
        title: '随机访问',
        paragraphs: ['scene.seek(t) 直接求 t，不依赖先播放 0…t。需要程序化运动时，优先写成 absolute-time provider 或可采样 Simulation，而不是累加每帧 delta。'],
      },
    ],
  },

  '/tutorial/transforms': {
    title: '变换与坐标系',
    lead: 'LOCAL / PARENT / WORLD 不是三个同义参数；它们决定相对向量和旋转到底在哪个坐标系解释。',
    sections: [
      {
        id: 'frames',
        title: 'LOCAL、PARENT、WORLD',
        code: code.frames,
        scene: 'transforms',
      },
      {
        id: 'camera',
        title: 'Camera 也是状态',
        paragraphs: ['Camera2D 的平移、缩放同样写入 Scene 时间轴。3D 中 Camera3D 决定投影，但 mesh 仍然按 Scene 绝对时间求 transform。'],
      },
      {
        id: 'kinematics',
        title: '层级变换就是正向运动学',
        paragraphs: ['串联机械臂不需要特殊动画系统：每个 link 放在父 frame 下，关节角就是局部 transform。'],
        scene: 'kinematics',
      },
    ],
  },

  '/tutorial/layout': {
    title: '布局与组合',
    lead: '布局负责算目标位置，不是持续运行的约束求解器。',
    sections: [
      {
        id: 'layout-once',
        title: 'add() 前：一次性布局',
        paragraphs: ['Row.place / Column.place / Grid.place 可以在对象进入 Scene 之前直接设置初始 transform。'],
      },
      {
        id: 'animated-layout',
        title: 'add() 后：动画到新布局',
        code: code.layout,
        scene: 'layout',
      },
      {
        id: 'rule',
        title: '一个实用规则',
        bullets: ['静态排版先 place，再 add。', '需要过渡时用 Scene.layout()。', '布局完成后对象仍是普通对象，可以继续 move / rotate / scale。'],
      },
    ],
  },

  '/tutorial/text-math-media': {
    title: 'Text、Math 与 Media',
    lead: '文字、公式、矢量资源和外部媒体都进入同一 Scene；区别只在资源如何生成与采样。',
    sections: [
      {
        id: 'text-math',
        title: 'Text 与 Math',
        paragraphs: ['Python 端通过 Typst 生成可缓存的矢量文档。Web/Vite plugin 可以在构建阶段预编译静态公式，因此生产浏览器不需要带 Typst 编译器。'],
        code: code.math,
        scene: 'math',
      },
      {
        id: 'vector',
        title: 'VectorDocument',
        paragraphs: ['SVG / Typst 输出进入 VectorDocument 后仍可 reveal、transform、morph，而不是被拍平成位图。'],
        scene: 'vectors',
      },
      {
        id: 'media',
        title: 'Image / GIF / Video / Audio',
        paragraphs: ['媒体对象与几何共享 Scene 时间。这里的 Gallery 输出仍是实时 Zanim canvas；media 示例内部加载视频/GIF，是为了展示该 API，而不是拿视频替代 Zanim 输出。'],
        scene: 'media',
      },
    ],
  },

  '/tutorial/dynamic': {
    title: '动态对象、Batch 与 Simulation',
    lead: '当状态来自时间函数、数值量或外部模拟时，不要制造大量临时对象；让对象直接采样状态。',
    sections: [
      {
        id: 'dynamic',
        title: 'Dynamic*：由时间直接求几何',
        code: code.dynamic,
        scene: 'electric-field',
      },
      {
        id: 'batch',
        title: 'Batch：大量同类 primitive',
        paragraphs: ['CircleSet / LineSet / RectSet 将几何打包成 retained batch。Scene.batch() 对整批数据做插值，适合网络图、点云、密集线段。'],
        scene: 'batches',
      },
      {
        id: 'simulation',
        title: 'Simulation：确定性状态机',
        paragraphs: ['Simulation 以固定步长推进，并保存 checkpoint，从而兼顾物理/算法状态与随机访问。碰撞示例就是 240 Hz 固定步长模拟。'],
        scene: 'collisions',
      },
    ],
  },

  '/tutorial/three-d': {
    title: '3D',
    lead: 'Web 端 3D 由 Zig/WASM 深度光栅器处理，再合成到同一 Canvas2D Scene。',
    sections: [
      {
        id: 'mesh-camera',
        title: 'Mesh、Transform、Camera',
        code: code.threeD,
        scene: 'three-d',
      },
      {
        id: 'time',
        title: '3D 仍然使用绝对时间',
        paragraphs: ['MeshObject3D 的 transform 可以是普通矩阵，也可以是 time → Transform3D provider。它和 2D DynamicObject 使用同一思想。'],
      },
      {
        id: 'hierarchy',
        title: '复杂层级',
        paragraphs: ['Rubik 示例把 cubie、贴纸、分层转动和逆序复原都放在同一绝对时间模型里。'],
        scene: 'rubiks-cube',
      },
    ],
  },

  '/tutorial/web': {
    title: 'Web Runtime',
    lead: '@zanim/web 不是 Python 渲染结果的播放器，而是同一 Scene 模型的浏览器实现。',
    sections: [
      {
        id: 'scene-create',
        title: '创建 Scene',
        code: code.web,
        scene: 'interactive-linear',
      },
      {
        id: 'vite',
        title: '使用 Vite plugin',
        paragraphs: ['建议在 Vite 中启用 @zanim/web/vite。它负责 WASM 资源 URL，并可处理静态 Typst/Math 编译。'],
      },
      {
        id: 'browser',
        title: '浏览器侧建议',
        bullets: ['Canvas 进入视口再创建复杂 Scene。', '离开视口后 pause，避免 Gallery 同时跑几十个场景。', '对可复现算法/模拟，优先把权威 Python trace 导出为静态数据。', '不要用录屏替代 Web runtime；需要视频时只把 Video 当成 Scene 内部的媒体对象。'],
      },
    ],
  },

  '/tutorial/scene-ir': {
    title: 'Scene IR',
    lead: 'Scene IR 是跨 runtime 的可移植边界，不是把任意 Python callback 魔法般序列化。',
    sections: [
      {
        id: 'export',
        title: '导出',
        code: code.ir,
      },
      {
        id: 'portable',
        title: '哪些东西可移植？',
        bullets: ['对象几何与样式。', '资源引用。', '时间轴 clip 与可表达的插值语义。', '已定义的 Scene / value 状态。'],
      },
      {
        id: 'limits',
        title: '明确失败比悄悄近似更好',
        paragraphs: ['任意 Python callback、运行时闭包和外部系统状态不应被假装成可移植 IR。需要跨 runtime 时，显式采样、导出数据或改写成支持的表达式。'],
      },
    ],
  },

  '/janim': {
    title: 'JAnim 致谢与参考',
    lead: 'Zanim 的部分早期示例与能力验证参考了 JAnim 的公开项目与演示。这里保留一组效果级复刻，用来验证 Zanim 是否能用自己的状态模型表达类似动画。',
    sections: [
      {
        id: 'thanks',
        title: '感谢 JAnim',
        paragraphs: [
          '感谢 JAnim 项目在动画 API、效果设计和示例组织方面给 Zanim 提供的参考与启发。',
          '这些场景不是 JAnim API 的兼容层，也不意味着 Zanim 追求逐 API 对齐。它们只使用 Zanim 自己的公开 API 重新实现可见效果，用作能力与回归测试。',
        ],
        links: [
          ['/gallery#janim', '查看 JAnim Gallery 分类'],
          ['https://github.com/jkjkil4/JAnim', 'JAnim 项目 ↗'],
        ],
      },
      {
        id: 'coverage',
        title: '当前覆盖',
        bullets: ['基础动画、Text、Typst、Number Plane。', 'Updater 风格效果、Arrow、Pie、Marked Item。', 'Frame Effect、Mask。', 'Torus / Cylinder / Cone 3D shapes。'],
        scene: 'janim-pi',
      },
    ],
  },

  '/reference': {
    title: '紧凑参考',
    lead: '这里只列需要建立记忆索引的核心名字；具体参数直接看源码、类型提示和 Gallery。',
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
        title: 'Scene 时间轴',
        table: [
          ['基础', 'add · remove · wait · at · parallel'],
          ['变换', 'move · rotate · scale · affine · transformFunction'],
          ['出现/消失', 'fadeIn · fadeOut · create'],
          ['批量/数值', 'batch · animateValue'],
          ['布局', 'layout'],
        ],
      },
      {
        id: 'spaces',
        title: '空间与可移植性',
        table: [
          ['坐标帧', 'LOCAL · PARENT · WORLD'],
          ['2D', 'Transform2D · Vec2'],
          ['3D', 'Transform3D · Vec3'],
          ['跨 runtime', 'Scene IR'],
        ],
      },
    ],
  },
}

export function pageFor(path) {
  return pages[path] ?? pages['/']
}
