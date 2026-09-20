import {
  Arrow,
  BLUE,
  Box3D,
  Camera3D,
  Circle,
  CircleSet,
  Column,
  DynamicCircleSet,
  DynamicLineSet,
  DynamicNumber,
  Easing,
  GIF,
  GREEN,
  Grid,
  Group,
  Image,
  Line,
  Math as ZMath,
  ORANGE,
  PURPLE,
  RED,
  Rectangle,
  Row,
  ScalarValue,
  Scene,
  Scene3DLayer,
  Square,
  Text,
  Transform2D,
  Transform3D,
  Vec3,
  Video,
  WHITE,
  WORLD,
  YELLOW,
} from '@zanim/web'

const BG = '#0b0f17'
const MUTED = '#95a0b8'
const T = (x = 0, y = 0, rotation = 0, scale = 1) =>
  Transform2D.affine({ position: [x, y], rotation, scale })

async function tutorialScene(canvas, unitSize = 92) {
  const rect = canvas.getBoundingClientRect()
  return Scene.create(canvas, {
    fps: 60,
    renderer: {
      unitSize: unitSize * Math.max(0.2, rect.width / 1280),
      background: BG,
    },
  })
}

function label(text, x, y, color = MUTED) {
  return new Text(text, { fontSize: 18, color, transform: T(x, y), zIndex: 20 })
}

function card(x, y, width = 2.7, height = 2.1) {
  return new Rectangle(width, height, {
    fill: 'rgba(255,255,255,.025)',
    stroke: 'rgba(155,170,200,.28)',
    strokeWidth: .018,
    transform: T(x, y),
    zIndex: -5,
  })
}

async function tutorialObjectsStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const square = new Square(1.15, {
    fill: 'rgba(86,145,255,.28)',
    stroke: BLUE,
    transform: T(-2.5, .25),
  })
  const circle = new Circle(.62, {
    fill: 'rgba(255,164,82,.28)',
    stroke: ORANGE,
    transform: T(0, .25),
  })
  const arrow = new Arrow([-1.0, -1.4], [1.0, -1.4], { stroke: GREEN, width: 4 })
  const text = new Text('Text', { fontSize: 34, transform: T(2.55, .25) })
  scene.add(
    square, circle, arrow, text,
    label('Square', -2.5, -1.0),
    label('Circle', 0, -1.0),
    label('Arrow', 0, -1.85),
    label('Text', 2.55, -1.0),
  )
  return scene
}

async function tutorialFirstAnimation(canvas) {
  const scene = await tutorialScene(canvas)
  const square = new Square(1.2, {
    fill: 'rgba(86,145,255,.28)',
    stroke: BLUE,
    transform: T(-2.8, 0),
  })
  scene.add(square)
  scene.move(square, [2.8, 0], { duration: 1.6 })
  scene.rotate(square, Math.PI / 2, { duration: .8 })
  scene.scale(square, 1.35, { duration: .7 })
  scene.wait(.35)
  return scene
}

async function tutorialGroupStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const arm = new Group([
    new Line([0, 0], [2.0, 0], { stroke: BLUE, strokeWidth: .07 }),
    new Circle(.13, { fill: YELLOW, stroke: null }),
    new Group([
      new Line([0, 0], [1.55, 0], { stroke: GREEN, strokeWidth: .065 }),
      new Circle(.12, { fill: ORANGE, stroke: null }),
    ], { transform: T(2.0, 0, .7) }),
  ], { transform: T(-1.4, -.25, -.25) })
  scene.add(
    card(-1.0, 0, 6.4, 3.6),
    arm,
    label('parent Group transform', -2.15, 1.65, BLUE),
    label('child local transform', 1.65, 1.15, GREEN),
    label('结构保留在层级中；没有时间线', 0, -2.15),
  )
  return scene
}

async function tutorialLifecycle(canvas) {
  const scene = await tutorialScene(canvas)
  const immediate = new Square(1.05, {
    fill: 'rgba(86,145,255,.3)', stroke: BLUE, transform: T(-2.7, 0),
  })
  const hidden = new Circle(.58, {
    fill: 'rgba(84,214,153,.3)', stroke: GREEN, opacity: 0, transform: T(0, 0),
  })
  const late = new Square(.85, {
    fill: 'rgba(255,174,82,.3)', stroke: ORANGE, transform: T(2.7, 0),
  })
  scene.add(immediate, hidden, label('add()', -2.7, -1.1), label('opacity=0', 0, -1.1))
  scene.wait(.7)
  scene.fadeIn(hidden, { duration: .7 })
  scene.wait(.45)
  scene.add(late, label('late add()', 2.7, -1.1))
  scene.wait(.7)
  scene.remove(immediate)
  scene.wait(.65)
  return scene
}

async function tutorialSequence(canvas) {
  const scene = await tutorialScene(canvas)
  const dot = new Circle(.16, { fill: YELLOW, stroke: null, transform: T(-3.2, 0) })
  scene.add(dot, new Line([-3.2, 0], [3.2, 0], { stroke: 'rgba(150,165,190,.32)', strokeWidth: .02 }))
  scene.move(dot, [0, 0], { duration: 1 })
  scene.move(dot, [3.2, 0], { duration: 1 })
  scene.scale(dot, 2.0, { duration: .6 })
  scene.wait(.3)
  return scene
}

async function tutorialParallel(canvas) {
  const scene = await tutorialScene(canvas)
  const square = new Square(1.1, {
    fill: 'rgba(86,145,255,.25)', stroke: BLUE, transform: T(-2.4, 0),
  })
  const circle = new Circle(.58, {
    fill: 'rgba(255,164,82,.25)', stroke: ORANGE, transform: T(2.4, 0),
  })
  scene.add(square, circle)
  scene.parallel(1.8, (api) => {
    api.move(square, [2.0, 0])
    api.scale(circle, 1.65, { at: .25 })
  })
  scene.wait(.35)
  return scene
}

async function tutorialFramesStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const specs = [
    ['LOCAL', -3.6, BLUE, .75],
    ['PARENT', 0, GREEN, .75],
    ['WORLD', 3.6, ORANGE, .75],
  ]
  for (const [name, x, color, rotation] of specs) {
    scene.add(card(x, 0, 2.9, 3.5))
    const parent = new Group([
      new Line([0, 0], [1.35, 0], { stroke: WHITE, strokeWidth: .035 }),
      new Line([0, 0], [0, 1.0], { stroke: 'rgba(220,225,238,.55)', strokeWidth: .025 }),
      new Arrow([0, 0], [1.25, 0], { stroke: color, width: 4 }),
    ], { transform: T(x, -.35, rotation) })
    scene.add(parent, label(name, x, 1.45, color))
  }
  scene.add(label('同一个向量，在不同 frame 中有不同含义', 0, -2.35))
  return scene
}

async function tutorialFrameMotion(canvas) {
  const scene = await tutorialScene(canvas)
  const parent = new Group([
    new Square(1.0, { fill: 'rgba(86,145,255,.16)', stroke: BLUE }),
    new Arrow([0, 0], [1.2, 0], { stroke: YELLOW, width: 4 }),
  ], { transform: T(-2.5, 0, .7) })
  scene.add(parent)
  scene.move(parent, [2.2, 0], { duration: 1.5, frame: WORLD })
  scene.rotate(parent, -1.2, { duration: 1.0 })
  scene.wait(.35)
  return scene
}

async function tutorialLayoutStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const makeSet = () => [
    new Square(.7, { fill: 'rgba(86,145,255,.25)', stroke: BLUE }),
    new Circle(.38, { fill: 'rgba(255,164,82,.25)', stroke: ORANGE }),
    new Square(.55, { fill: 'rgba(84,214,153,.25)', stroke: GREEN }),
    new Circle(.3, { fill: 'rgba(180,118,255,.25)', stroke: PURPLE }),
  ]
  const row = makeSet(), column = makeSet(), grid = makeSet()
  new Row({ gap: .38, at: [-3.5, 0] }).place(...row)
  new Column({ gap: .28, at: [0, 0] }).place(...column)
  new Grid({ rows: 2, cols: 2, gap: [.45, .35], at: [3.5, 0] }).place(...grid)
  scene.add(...row, ...column, ...grid)
  scene.add(label('Row', -3.5, 1.65, BLUE), label('Column', 0, 1.65, GREEN), label('Grid', 3.5, 1.65, ORANGE))
  return scene
}

async function tutorialLayoutTransition(canvas) {
  const scene = await tutorialScene(canvas)
  const items = [
    new Square(.85, { fill: 'rgba(86,145,255,.25)', stroke: BLUE }),
    new Circle(.43, { fill: 'rgba(255,164,82,.25)', stroke: ORANGE }),
    new Square(.72, { fill: 'rgba(84,214,153,.25)', stroke: GREEN }),
    new Circle(.36, { fill: 'rgba(180,118,255,.25)', stroke: PURPLE }),
  ]
  new Row({ gap: .55, at: [0, 0] }).place(...items)
  scene.add(...items)
  scene.wait(.5)
  scene.layout(...items, { to: new Grid({ rows: 2, cols: 2, gap: [.7, .55], at: [0, 0] }), duration: 1.3 })
  scene.wait(.55)
  scene.layout(...items, { to: new Row({ gap: .55, at: [0, 0] }), duration: 1.1 })
  scene.wait(.3)
  return scene
}

async function tutorialMathStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const equation = new ZMath('f(x) = integral_0^x e^(-t^2) dif t', {
    fontSize: 36,
    color: '#eef2fa',
    transform: T(0, 1.3),
  })
  const matrix = new ZMath('mat(1, 2; 3, 4) times vec(x, y) = vec(x + 2y, 3x + 4y)', {
    fontSize: 31,
    color: '#eef2fa',
    transform: T(0, -.35),
  })
  const identity = new ZMath('e^(i pi) + 1 = 0', {
    fontSize: 34,
    color: '#f5cf5a',
    transform: T(0, -1.9),
  })
  await Promise.all([equation.ready, matrix.ready, identity.ready])
  scene.add(equation, matrix, identity)
  return scene
}

async function tutorialScalarValue(canvas) {
  const scene = await tutorialScene(canvas)
  const value = new ScalarValue(0)
  scene.addValue(value)
  const number = new DynamicNumber(value, {
    digits: 1,
    suffix: '%',
    fontSize: 54,
    color: YELLOW,
    transform: T(0, .3),
  })
  scene.add(number, label('一个 ScalarValue 驱动显示值', 0, 1.55))
  scene.animateValue(value, { to: 100, duration: 3.2, easing: Easing.SMOOTHSTEP })
  scene.wait(.35)
  return scene
}

async function tutorialBatchStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const dots = []
  for (let y = -3; y <= 3; y++) {
    for (let x = -7; x <= 7; x++) {
      const px = x * .48
      const py = y * .48
      const color = (x + y) % 3 === 0 ? BLUE : (x - y) % 4 === 0 ? ORANGE : 'rgba(210,220,240,.62)'
      dots.push([px, py, .065, color])
    }
  }
  scene.add(new CircleSet(dots), label('105 circles · one retained batch', 0, 2.25))
  return scene
}

async function tutorialProvider(canvas) {
  const scene = await tutorialScene(canvas)
  const trail = new DynamicLineSet((time) => {
    const out = []
    const count = 42
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2
      const r = 1.55 + .2 * Math.sin(time * 2 + i * .7)
      const x = r * Math.cos(a), y = r * Math.sin(a)
      const nx = (r + .48) * Math.cos(a), ny = (r + .48) * Math.sin(a)
      out.push([x, y, nx, ny, BLUE, .022])
    }
    return out
  }, { worldStroke: true })
  const point = new DynamicCircleSet((time) => [[
    2.25 * Math.cos(time * 1.25),
    2.25 * Math.sin(time * 1.25),
    .12,
    YELLOW,
  ]])
  scene.add(trail, point)
  scene.wait(5)
  return scene
}

async function tutorial3DStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const camera = new Camera3D({ position: new Vec3(5.8, 4.4, 7.4), target: new Vec3(), fovYDegrees: 36 })
  const objects = [
    Box3D(new Vec3(2.0, 2.0, 2.0), { color: '#5f97e8', transform: Transform3D.translation(-1.4, 0, 0) }),
    Box3D(new Vec3(1.4, 2.8, 1.4), { color: '#65c995', transform: Transform3D.translation(1.45, 0, 0) }),
  ]
  scene.add(new Scene3DLayer(objects, { camera, resolution: .82 }), label('Camera3D + MeshObject3D', 0, -2.55))
  return scene
}

async function tutorial3DMotion(canvas) {
  const scene = await tutorialScene(canvas)
  const camera = new Camera3D({ position: new Vec3(5.8, 4.4, 7.4), target: new Vec3(), fovYDegrees: 36 })
  const cube = Box3D(new Vec3(2.2, 2.2, 2.2), {
    color: '#5f97e8',
    transform: (time) => Transform3D.rotationY(time * .9).mul(Transform3D.rotationZ(time * .38)),
  })
  scene.add(new Scene3DLayer([cube], { camera, resolution: .82 }))
  scene.wait(5)
  return scene
}

async function tutorialMedia(canvas) {
  const scene = await tutorialScene(canvas)
  const base = import.meta.env.BASE_URL
  const image = new Image(`${base}assets/image.png`, { width: 3.0, transform: T(-3.4, .2) })
  const gif = new GIF(`${base}assets/anim.gif`, { width: 2.7, transform: T(0, .2) })
  const video = new Video(`${base}assets/clip.mp4`, { width: 3.2, muted: true, transform: T(3.45, .2) })
  await Promise.all([image.ready, gif.ready, video.ready])
  scene.add(image, gif, video, label('Image', -3.4, -1.65), label('GIF', 0, -1.65), label('Video', 3.45, -1.65))
  scene.parallel(3.8, (api) => {
    api.media(image, { duration: 3.8 })
    api.media(gif, { duration: 3.8, loop: true })
    api.media(video, { duration: 3.8, loop: true })
  })
  return scene
}

async function tutorialIRStatic(canvas) {
  const scene = await tutorialScene(canvas)
  const boxes = [
    [-3.7, 'Python Scene', BLUE],
    [0, 'Scene IR', YELLOW],
    [3.7, 'Web Scene', GREEN],
  ]
  for (const [x, text, color] of boxes) {
    scene.add(
      new Rectangle(2.7, 1.25, {
        fill: 'rgba(255,255,255,.025)',
        stroke: color,
        strokeWidth: .028,
        transform: T(x, 0),
      }),
      new Text(text, { fontSize: 25, color, transform: T(x, 0) }),
    )
  }
  scene.add(
    new Arrow([-2.25, 0], [-1.45, 0], { stroke: WHITE, width: 4 }),
    new Arrow([1.45, 0], [2.25, 0], { stroke: WHITE, width: 4 }),
    label('可移植状态', 0, -1.35),
    label('任意 Python callback 不会被伪装成通用 IR', 0, -2.15),
  )
  return scene
}

export const tutorialScenes = [
  { id:'tutorial-objects-static', title:'Objects', source:'tutorial/core.py · ObjectsStatic', width:1280, height:720, builder:tutorialObjectsStatic, static:true },
  { id:'tutorial-first-animation', title:'First animation', source:'tutorial/core.py · FirstAnimation', width:1280, height:720, builder:tutorialFirstAnimation },
  { id:'tutorial-group-static', title:'Group hierarchy', source:'tutorial/core.py · GroupStatic', width:1280, height:720, builder:tutorialGroupStatic, static:true },
  { id:'tutorial-lifecycle', title:'Scene lifecycle', source:'tutorial/core.py · Lifecycle', width:1280, height:720, builder:tutorialLifecycle },
  { id:'tutorial-sequence', title:'Sequential timeline', source:'tutorial/timeline.py · Sequence', width:1280, height:720, builder:tutorialSequence },
  { id:'tutorial-parallel', title:'Parallel timeline', source:'tutorial/timeline.py · Parallel', width:1280, height:720, builder:tutorialParallel },
  { id:'tutorial-frames-static', title:'Coordinate frames', source:'tutorial/transforms.py · FramesStatic', width:1280, height:720, builder:tutorialFramesStatic, static:true },
  { id:'tutorial-frame-motion', title:'World-frame motion', source:'tutorial/transforms.py · FrameMotion', width:1280, height:720, builder:tutorialFrameMotion },
  { id:'tutorial-layout-static', title:'Layout primitives', source:'tutorial/layout.py · LayoutStatic', width:1280, height:720, builder:tutorialLayoutStatic, static:true },
  { id:'tutorial-layout-transition', title:'Layout transition', source:'tutorial/layout.py · LayoutTransition', width:1280, height:720, builder:tutorialLayoutTransition },
  { id:'tutorial-math-static', title:'Typst math', source:'tutorial/content.py · MathStatic', width:1280, height:720, builder:tutorialMathStatic, static:true },
  { id:'tutorial-scalar-value', title:'ScalarValue', source:'tutorial/dynamic.py · ScalarValueDemo', width:1280, height:720, builder:tutorialScalarValue },
  { id:'tutorial-batch-static', title:'Batch geometry', source:'tutorial/dynamic.py · BatchStatic', width:1280, height:720, builder:tutorialBatchStatic, static:true },
  { id:'tutorial-provider', title:'Absolute-time provider', source:'tutorial/dynamic.py · ProviderMotion', width:1280, height:720, builder:tutorialProvider },
  { id:'tutorial-3d-static', title:'3D composition', source:'tutorial/three_d.py · ThreeDStatic', width:1280, height:720, builder:tutorial3DStatic, static:true },
  { id:'tutorial-3d-motion', title:'3D absolute-time motion', source:'tutorial/three_d.py · ThreeDMotion', width:1280, height:720, builder:tutorial3DMotion },
  { id:'tutorial-media', title:'Media', source:'tutorial/content.py · MediaDemo', width:1280, height:720, builder:tutorialMedia },
  { id:'tutorial-ir-static', title:'Scene IR boundary', source:'tutorial/ir.py · IRStatic', width:1280, height:720, builder:tutorialIRStatic, static:true },
]
