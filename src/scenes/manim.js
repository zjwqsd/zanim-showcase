import {
  Arrow,
  BLUE,
  Box3D,
  Camera3D,
  Circle,
  DynamicCircleSet,
  DynamicLineSet,
  DynamicPolyline,
  DynamicRectSet,
  Easing,
  GREEN,
  Group,
  Line,
  LineSet,
  ORANGE,
  PI,
  PINK,
  Polygon,
  PURPLE,
  RED,
  Rectangle,
  ScalarValue,
  Scene,
  Scene3DLayer,
  Square,
  TAU,
  Text,
  Transform2D,
  Transform3D,
  Vec3,
  WHITE,
  YELLOW,
} from '@zanim/web'

const CYAN = '#69c8ff'
const MUTED = '#919eb8'
const BG = '#0e1118'
const T = (x = 0, y = 0, rotation = 0, scale = 1) =>
  Transform2D.affine({ position: [x, y], rotation, scale })
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const lerp = (a, b, t) => a + (b - a) * t

async function makeScene(canvas, { unitSize = 90 } = {}) {
  const rect = canvas.getBoundingClientRect()
  const scale = Math.max(0.2, rect.width / 1280)
  return Scene.create(canvas, {
    fps: 60,
    renderer: { unitSize: unitSize * scale, background: BG },
  })
}

function heading(scene, name, subtitle = 'Manim Community Example Gallery · Zanim port') {
  scene.add(
    new Text(name, { fontSize: 31, transform: T(0, 3.25), zIndex: 30 }),
    new Text(subtitle, { fontSize: 17, color: MUTED, transform: T(0, 2.82), zIndex: 30 }),
  )
}

function dot(x, y, color = WHITE, radius = .09) {
  return new Circle(radius, { fill: color, stroke: null, transform: T(x, y), zIndex: 8 })
}

function gridItems(x0 = -5.5, x1 = 5.5, y0 = -2.5, y1 = 2.5, step = .5) {
  const out = []
  for (let x = x0; x <= x1 + 1e-8; x += step) {
    out.push([x, y0, x, y1, 'rgba(108,124,150,.17)', .012])
  }
  for (let y = y0; y <= y1 + 1e-8; y += step) {
    out.push([x0, y, x1, y, 'rgba(108,124,150,.17)', .012])
  }
  out.push([x0, 0, x1, 0, 'rgba(190,201,221,.55)', .02])
  out.push([0, y0, 0, y1, 'rgba(190,201,221,.55)', .02])
  return out
}

function polylineLines(points, color = CYAN, width = .03) {
  return points.slice(0, -1).map((p, i) => [
    p[0], p[1], points[i + 1][0], points[i + 1][1], color, width,
  ])
}

function sampleGraph(fn, x0, x1, samples, map) {
  return Array.from({ length: samples }, (_, i) => {
    const x = lerp(x0, x1, i / (samples - 1))
    return map(x, fn(x))
  })
}

async function manimCELogo(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'ManimCELogo')
  scene.add(
    new Circle(1.08, { fill: '#87c2a5', stroke: null, transform: T(-1.2, -.15) }),
    new Square(2.0, { fill: '#525893', stroke: null, transform: T(.05, .86) }),
    new Polygon([[0, -1.05], [1.25, 1], [-1.25, 1]], {
      fill: '#e07a5f', stroke: null, transform: T(1.2, -.12),
    }),
    new Text('M', { fontSize: 102, color: '#ece6e2', transform: T(-1.62, .6), zIndex: 8 }),
  )
  scene.wait(4)
  return scene
}

async function braceAnnotation(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'BraceAnnotation')
  const a = [-2.8, -1.15], b = [2.7, 1.2]
  scene.add(
    new Line(a, b, { stroke: ORANGE, strokeWidth: .05 }),
    dot(...a, BLUE), dot(...b, GREEN),
    new Text('Horizontal distance', { fontSize: 21, transform: T(0, -1.75) }),
    new Text('⏞', { fontSize: 78, color: WHITE, transform: T(0, -1.18, .42) }),
    new Text('x − x₁', { fontSize: 21, color: YELLOW, transform: T(.45, 1.45) }),
  )
  scene.wait(4)
  return scene
}

async function vectorArrow(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'VectorArrow')
  scene.add(
    new LineSet(gridItems(), { worldStroke: true, zIndex: -2 }),
    dot(0, 0, WHITE),
    new Arrow([0, 0], [2.5, 2], { stroke: BLUE, width: 5 }),
    new Text('(0, 0)', { fontSize: 18, transform: T(.3, -.32) }),
    new Text('(2, 2)', { fontSize: 18, transform: T(2.85, 2.1) }),
  )
  scene.wait(4)
  return scene
}

async function gradientImageFromArray(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'GradientImageFromArray')
  const rows = Array.from({ length: 128 }, (_, i) => {
    const v = Math.round(255 * i / 127).toString(16).padStart(2, '0')
    return [-3.2 + i * .05, -.1, .052, 3.6, `#${v}${v}${v}`, null, 0]
  })
  scene.add(
    new DynamicRectSet(() => rows),
    new Rectangle(6.48, 3.66, { fill: null, stroke: GREEN, strokeWidth: .045 }),
  )
  scene.wait(4)
  return scene
}

async function booleanOperations(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'BooleanOperations')

  const leftA = new Circle(1.45, { fill: 'rgba(80,145,255,.36)', stroke: BLUE, opacity: 0, transform: T(-3.75, -.05) })
  const leftB = new Circle(1.45, { fill: 'rgba(245,82,98,.34)', stroke: RED, opacity: 0, transform: T(-2.15, -.05) })
  const sourceLabel = new Text('Boolean Operation', { fontSize: 23, opacity: 0, transform: T(-2.95, 2.05) })

  const results = [
    ['Intersection', 2.1, 1.45, GREEN],
    ['Union', 4.45, 1.45, ORANGE],
    ['Difference', 2.1, -1.25, PINK],
    ['Exclusion', 4.45, -1.25, YELLOW],
  ].map(([name, x, y, color]) => {
    const a = new Circle(.58, { fill: `${color}42`, stroke: color, opacity: 0, transform: T(x - .24, y) })
    const b = new Circle(.58, { fill: `${color}2f`, stroke: color, opacity: 0, transform: T(x + .24, y) })
    const label = new Text(name, { fontSize: 16, color, opacity: 0, transform: T(x, y + .9) })
    return { a, b, label }
  })

  scene.add(leftA, leftB, sourceLabel, ...results.flatMap((item) => [item.a, item.b, item.label]))
  scene.parallel(.85, (api) => {
    api.fadeIn(leftA)
    api.fadeIn(leftB, { at: .08 })
    api.fadeIn(sourceLabel, { at: .16 })
  })
  scene.wait(.2)
  for (const item of results) {
    scene.parallel(.62, (api) => {
      api.fadeIn(item.a)
      api.fadeIn(item.b, { at: .08 })
      api.fadeIn(item.label, { at: .18 })
    })
    scene.wait(.15)
  }
  scene.parallel(.55, (api) => {
    api.scale(leftA, .78)
    api.scale(leftB, .78)
  })
  scene.parallel(.35, (api) => {
    api.rotate(leftA, -.18)
    api.rotate(leftB, .18)
  })
  scene.wait(.55)
  return scene
}

async function pointMovingOnShapes(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'PointMovingOnShapes')
  const progress = new ScalarValue(0)
  scene.addValue(progress)
  const square = [[2.7, -1.3], [4.8, -1.3], [4.8, .8], [2.7, .8], [2.7, -1.3]]
  const marker = new DynamicCircleSet((time) => {
    const u = scene.valueAt(progress, time)
    let p
    if (u < 1) p = [lerp(-5, -2.7, u), lerp(-1.2, 1.2, u)]
    else if (u < 2) {
      const a = TAU * (u - 1)
      p = [1.35 * Math.cos(a), 1.35 * Math.sin(a)]
    } else {
      const q = Math.min(3.999, (u - 2) * 4)
      const k = Math.floor(q), a = q - k
      p = [lerp(square[k][0], square[k + 1][0], a), lerp(square[k][1], square[k + 1][1], a)]
    }
    return [[p[0], p[1], .12, YELLOW]]
  })
  scene.add(
    new Line([-5, -1.2], [-2.7, 1.2], { stroke: BLUE, strokeWidth: .04 }),
    new Circle(1.35, { fill: null, stroke: GREEN }),
    new LineSet(polylineLines(square, ORANGE, .04), { worldStroke: true }),
    marker,
  )
  scene.animateValue(progress, { to: 3, duration: 7, easing: Easing.LINEAR })
  scene.wait(.4)
  return scene
}

async function movingAround(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'MovingAround')
  const square = new Square(1.5, { fill: 'rgba(80,145,255,.28)', stroke: BLUE })
  const circle = new Circle(.75, { fill: 'rgba(245,135,55,.3)', stroke: ORANGE })
  scene.add(square, circle)
  scene.parallel(1.2, (api) => {
    api.move(square, [-2.8, .4])
    api.move(circle, [2.8, -.4])
  })
  scene.parallel(1.3, (api) => {
    api.rotate(square, PI)
    api.scale(circle, 1.7)
  })
  scene.parallel(1.2, (api) => {
    api.move(square, [2.1, -1.1])
    api.move(circle, [-2.1, 1.1])
  })
  scene.wait(.5)
  return scene
}

async function movingAngle(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'MovingAngle')
  const angle = new ScalarValue(110 * PI / 180)
  scene.addValue(angle)
  scene.add(
    new DynamicLineSet((time) => {
      const a = scene.valueAt(angle, time)
      return [
        [-3.4, 0, 3.4, 0, WHITE, .03],
        [-3.4, 0, -3.4 + 5.1 * Math.cos(a), 5.1 * Math.sin(a), BLUE, .045],
      ]
    }, { worldStroke: true }),
    new DynamicPolyline((time) => {
      const a = scene.valueAt(angle, time)
      return Array.from({ length: 50 }, (_, i) => {
        const q = a * i / 49
        return [-3.4 + .76 * Math.cos(q), .76 * Math.sin(q)]
      })
    }, { stroke: YELLOW, strokeWidth: .04 }),
    new Text('θ', { fontSize: 28, color: YELLOW, transform: T(-2.48, .62) }),
  )
  scene.animateValue(angle, { to: 40 * PI / 180, duration: 1.4 })
  scene.animateValue(angle, { to: PI, duration: 1.6 })
  scene.animateValue(angle, { to: 350 * PI / 180, duration: 2 })
  scene.wait(.4)
  return scene
}

async function movingDots(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'MovingDots')
  const x = new ScalarValue(-1.3), y = new ScalarValue(.7)
  scene.addValue(x); scene.addValue(y)
  scene.add(
    new DynamicLineSet((time) => {
      const xv = scene.valueAt(x, time), yv = scene.valueAt(y, time)
      return [[xv, 0, 1.2, yv, RED, .04]]
    }, { worldStroke: true }),
    new DynamicCircleSet((time) => {
      const xv = scene.valueAt(x, time), yv = scene.valueAt(y, time)
      return [[xv, 0, .12, BLUE], [1.2, yv, .12, GREEN]]
    }),
  )
  scene.animateValue(x, { to: 4.2, duration: 2.3 })
  scene.animateValue(y, { to: 2.4, duration: 2.0 })
  scene.wait(.6)
  return scene
}

async function movingGroupToDestination(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'MovingGroupToDestination')
  const a = new Circle(.55, { fill: 'rgba(80,145,255,.4)', stroke: BLUE, transform: T(-.75, 0) })
  const b = new Square(1, { fill: 'rgba(80,210,135,.35)', stroke: GREEN, transform: T(.75, 0) })
  const group = new Group([a, b])
  scene.add(
    group,
    new Rectangle(3.4, 1.8, { fill: null, stroke: MUTED, strokeWidth: .025, transform: T(3.2, .3) }),
  )
  scene.move(group, [3.2, .3], { duration: 2 })
  scene.rotate(group, PI / 3, { duration: 1.2 })
  scene.wait(.6)
  return scene
}

async function movingFrameBox(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'MovingFrameBox')
  const formula = new Text('a²   +   b²   =   c²', { fontSize: 52, transform: T(0, .2) })
  const box = new Rectangle(1.6, 1.12, {
    fill: 'rgba(250,210,78,.08)', stroke: YELLOW, strokeWidth: .04, transform: T(-3.0, .2),
  })
  scene.add(formula, box)
  scene.move(box, [3.0, 0], { duration: 1.4 })
  scene.move(box, [3.0, 0], { duration: 1.4 })
  scene.wait(.6)
  return scene
}

async function rotationUpdater(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'RotationUpdater')
  scene.add(
    new DynamicLineSet((time) => {
      const a = time * 1.35
      return [
        [0, 0, 3.1 * Math.cos(a), 3.1 * Math.sin(a), BLUE, .055],
        [0, 0, 2.2 * Math.cos(-1.7 * a), 2.2 * Math.sin(-1.7 * a), ORANGE, .035],
      ]
    }, { worldStroke: true }),
    dot(0, 0, WHITE, .11),
  )
  scene.wait(5)
  return scene
}

async function pointWithTrace(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'PointWithTrace')
  const pathAt = (time) => {
    const u = clamp01(time / 5)
    const pts = []
    const count = Math.max(2, Math.floor(180 * u))
    for (let i = 0; i < count; i++) {
      const q = 5 * i / 179
      if (q < 2) {
        const a = PI * q / 2
        pts.push([1 + 2 * Math.cos(PI - a), 2 * Math.sin(PI - a)])
      } else if (q < 3.5) {
        pts.push([-1, lerp(0, 2.5, (q - 2) / 1.5)])
      } else {
        pts.push([lerp(-1, -4, (q - 3.5) / 1.5), 2.5])
      }
    }
    return pts
  }
  scene.add(
    new DynamicPolyline(pathAt, { stroke: CYAN, strokeWidth: .045 }),
    new DynamicCircleSet((time) => {
      const p = pathAt(time).at(-1)
      return [[p[0], p[1], .11, YELLOW]]
    }),
  )
  scene.wait(5.4)
  return scene
}

async function sinAndCosFunctionPlot(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'SinAndCosFunctionPlot')
  const map = (x, y) => [x * .62, y * 1.35]
  scene.add(
    new LineSet(gridItems(-5.2, 5.2, -2.25, 2.25, 1), { worldStroke: true, zIndex: -2 }),
    new LineSet(polylineLines(sampleGraph(Math.sin, -8, 8, 300, map), BLUE, .035), { worldStroke: true }),
    new LineSet(polylineLines(sampleGraph(Math.cos, -8, 8, 300, map), RED, .035), { worldStroke: true }),
    new Text('sin(x)', { fontSize: 18, color: BLUE, transform: T(-4.25, 1.65) }),
    new Text('cos(x)', { fontSize: 18, color: RED, transform: T(3.55, 1.65) }),
    new Text('x = 2π', { fontSize: 17, color: YELLOW, transform: T(3.9, -1.85) }),
  )
  scene.wait(4)
  return scene
}

async function argMinExample(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'ArgMinExample')
  const x = new ScalarValue(0)
  scene.addValue(x)
  const map = (px, py) => [-4.8 + px * .96, -1.8 + py * .037]
  const curve = sampleGraph((v) => 2 * (v - 5) ** 2, 0, 10, 240, map)
  scene.add(
    new LineSet(polylineLines(curve, PINK, .035), { worldStroke: true }),
    new DynamicCircleSet((time) => {
      const v = scene.valueAt(x, time), p = map(v, 2 * (v - 5) ** 2)
      return [[p[0], p[1], .11, YELLOW]]
    }),
    new Text('f(x)=2(x−5)²', { fontSize: 19, color: PINK, transform: T(3.55, 1.95) }),
  )
  scene.animateValue(x, { to: 5, duration: 2.8 })
  scene.wait(.7)
  return scene
}

async function graphAreaPlot(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'GraphAreaPlot')
  const map = (x, y) => [-4.5 + x * 1.7, -2.1 + y * .7]
  const f1 = (x) => 4 * x - x * x
  const f2 = (x) => .8 * x * x - 3 * x + 4
  const p1 = sampleGraph(f1, 0, 4, 180, map)
  const p2 = sampleGraph(f2, 0, 4, 180, map)
  const rects = []
  for (let x = .25; x < .7; x += .06) {
    const a = map(x, 0), b = map(x + .06, f1(x))
    rects.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, b[0] - a[0], b[1] - a[1], 'rgba(80,145,255,.45)', BLUE, .01])
  }
  scene.add(
    new LineSet(gridItems(-5.2, 4.7, -2.35, 2.4, 1), { worldStroke: true, zIndex: -3 }),
    new LineSet(polylineLines(p1, BLUE, .035), { worldStroke: true }),
    new LineSet(polylineLines(p2, GREEN, .035), { worldStroke: true }),
    new DynamicRectSet(() => rects, { zIndex: -1 }),
  )
  scene.wait(4)
  return scene
}

async function polygonOnAxes(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'PolygonOnAxes')
  const x = new ScalarValue(5)
  scene.addValue(x)
  const k = 25
  const map = (px, py) => [-4.6 + px * .72, -2.25 + py * .42]
  const graph = sampleGraph((v) => k / v, 2.5, 10, 180, map)
  scene.add(
    new LineSet(polylineLines(graph, YELLOW, .035), { worldStroke: true }),
    new DynamicRectSet((time) => {
      const xv = scene.valueAt(x, time), yv = k / xv
      const o = map(0, 0), p = map(xv, yv)
      return [[(o[0] + p[0]) / 2, (o[1] + p[1]) / 2, p[0] - o[0], p[1] - o[1], 'rgba(80,145,255,.28)', YELLOW, .018]]
    }),
    new DynamicCircleSet((time) => {
      const xv = scene.valueAt(x, time), p = map(xv, k / xv)
      return [[p[0], p[1], .11, ORANGE]]
    }),
    new Text('x · y = 25', { fontSize: 20, color: YELLOW, transform: T(3.4, 1.95) }),
  )
  scene.animateValue(x, { to: 10, duration: 1.8 })
  scene.animateValue(x, { to: 2.5, duration: 2.2 })
  scene.animateValue(x, { to: 5, duration: 1.5 })
  scene.wait(.4)
  return scene
}

async function heatDiagramPlot(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'HeatDiagramPlot')
  const pts = [[0, 20], [8, 0], [38, 0], [39, -5]].map(([x, y]) => [-4.8 + x * .235, -1.55 + y * .13])
  scene.add(
    new LineSet(gridItems(-5.2, 4.7, -2.4, 2.2, .8), { worldStroke: true, zIndex: -2 }),
    new LineSet(polylineLines(pts, BLUE, .05), { worldStroke: true }),
    new DynamicCircleSet(() => pts.map((p) => [p[0], p[1], .09, BLUE])),
    new Text('Temperature', { fontSize: 18, color: MUTED, transform: T(-4.1, 2.0) }),
  )
  scene.wait(4)
  return scene
}

async function followingGraphCamera(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'FollowingGraphCamera')
  const map = (x, y) => [x - 3.5, y * .55 - .5]
  const fn = (x) => .35 * (x - 3) * (x - 3) + .4
  const curve = sampleGraph(fn, -1, 8, 260, map)
  const tracker = dot(-4.5, map(-1, fn(-1))[1], YELLOW, .12)
  scene.add(new LineSet(polylineLines(curve, BLUE, .04), { worldStroke: true }), tracker)
  scene.move(tracker, [7.5, map(8, fn(8))[1] - tracker.center.y], { duration: 5 })
  scene.camera.affine({ position: [2.8, .4], scale: 1.35, duration: 2.2 })
  scene.camera.affine({ position: [0, 0], scale: 1, duration: 2.2 })
  scene.wait(.5)
  return scene
}

async function movingZoomedSceneAround(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'MovingZoomedSceneAround')
  const dots = []
  for (let i = 0; i < 80; i++) {
    const a = TAU * i / 80, r = .4 + 2.2 * ((i * 37) % 79) / 79
    dots.push([r * Math.cos(a), r * Math.sin(a), .035, i % 3 === 0 ? BLUE : WHITE])
  }
  const focus = new Rectangle(1.5, 1.0, { fill: null, stroke: YELLOW, strokeWidth: .035, transform: T(-2.2, .6) })
  scene.add(new DynamicCircleSet(() => dots), focus)
  scene.move(focus, [4.3, -1.4], { duration: 2.5 })
  scene.scale(focus, 1.7, { duration: 1.2 })
  scene.wait(.8)
  return scene
}

async function fixedInFrameMObjectTest(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'FixedInFrameMObjectTest')
  const world = new Group([
    new LineSet(gridItems(-5.2, 5.2, -2.3, 2.3, .5), { worldStroke: true }),
    new Square(1.1, { fill: 'rgba(80,145,255,.25)', stroke: BLUE, transform: T(1.8, .5) }),
  ])
  const fixed = new Text('固定在画面上的说明文字', { fontSize: 21, color: YELLOW, transform: T(0, -2.35), zIndex: 20 })
  scene.add(world, fixed)
  scene.camera.affine({ position: [1.5, .5], scale: 1.5, duration: 2 })
  scene.camera.affine({ position: [-1.2, -.2], scale: .9, duration: 2 })
  scene.wait(.5)
  return scene
}

async function threeDLightSourcePosition(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'ThreeDLightSourcePosition')
  const camera = new Camera3D({ position: new Vec3(5, 4, 7), target: new Vec3(), fovYDegrees: 34 })
  const objects = [
    Box3D(new Vec3(2.2, 2.2, .25), { color: '#4c84c6', transform: Transform3D.translation(-1.3, 0, 0) }),
    Box3D(new Vec3(2.0, 2.0, 2.0), { color: '#8ccf9d', transform: Transform3D.translation(1.3, 0, .6) }),
  ]
  scene.add(new Scene3DLayer(objects, { camera, resolution: .8 }))
  scene.wait(4.5)
  return scene
}

async function threeDCameraRotation(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'ThreeDCameraRotation')
  const camera = new Camera3D({ position: new Vec3(5.5, 4.5, 7.5), target: new Vec3(), fovYDegrees: 34 })
  const cube = Box3D(new Vec3(2.2, 2.2, 2.2), {
    color: '#568bd2',
    transform: (time) => Transform3D.rotationZ(.35 * time).mul(Transform3D.rotationY(.7 * time)),
  })
  scene.add(new Scene3DLayer([cube], { camera, resolution: .82 }))
  scene.wait(6)
  return scene
}

async function threeDCameraIllusionRotation(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'ThreeDCameraIllusionRotation')
  const camera = new Camera3D({ position: new Vec3(5.5, 4.2, 7.5), target: new Vec3(), fovYDegrees: 34 })
  const bars = [
    Box3D(new Vec3(3.4, .18, .18), { color: RED, transform: (time) => Transform3D.rotationZ(.7 * time) }),
    Box3D(new Vec3(.18, 3.4, .18), { color: GREEN, transform: (time) => Transform3D.rotationZ(.7 * time) }),
    Box3D(new Vec3(.18, .18, 3.4), { color: BLUE, transform: (time) => Transform3D.rotationZ(.7 * time) }),
  ]
  scene.add(new Scene3DLayer(bars, { camera, resolution: .82 }))
  scene.wait(6)
  return scene
}

async function threeDSurfacePlot(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'ThreeDSurfacePlot')
  const camera = new Camera3D({ position: new Vec3(6.5, 5.2, 8.5), target: new Vec3(), fovYDegrees: 34 })
  const tiles = []
  for (let ix = -5; ix <= 5; ix++) {
    for (let iy = -5; iy <= 5; iy++) {
      const x = ix * .42, y = iy * .42
      const z = .75 * Math.cos(x * 1.4) * Math.cos(y * 1.4)
      const c = z > 0 ? '#5ea7e8' : '#675cb8'
      tiles.push(Box3D(new Vec3(.36, .36, .08), {
        color: c,
        transform: Transform3D.translation(x, y, z),
      }))
    }
  }
  scene.add(new Scene3DLayer(tiles, { camera, resolution: .78 }))
  scene.wait(5)
  return scene
}

async function openingManim(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'OpeningManim', 'Text → transform → coordinate plane')
  const intro = new Text('This is some LaTeX', { fontSize: 42, opacity: 0 })
  const formula = new Text('τ = 2π', { fontSize: 72, color: YELLOW, opacity: 0 })
  const grid = new LineSet(gridItems(-6, 6, -3.2, 3.2, .5), { worldStroke: true, opacity: 0 })
  scene.add(intro, formula, grid)
  scene.fadeIn(intro, { duration: .8 })
  scene.wait(.5)
  scene.parallel(1, (api) => { api.fadeOut(intro); api.fadeIn(formula) })
  scene.wait(.5)
  scene.parallel(1, (api) => { api.fadeOut(formula); api.fadeIn(grid) })
  scene.camera.affine({ position: [1.1, .5], scale: 1.25, duration: 1.6 })
  scene.camera.affine({ position: [0, 0], scale: 1, duration: 1.4 })
  scene.wait(.5)
  return scene
}

async function sineCurveUnitCircle(canvas) {
  const scene = await makeScene(canvas)
  heading(scene, 'SineCurveUnitCircle')
  const phase = new ScalarValue(0)
  scene.addValue(phase)
  const cx = -3.5, cy = 0, radius = 1.45
  const circle = new Circle(radius, { fill: null, stroke: WHITE, transform: T(cx, cy) })
  const curve = new DynamicPolyline((time) => {
    const p = scene.valueAt(phase, time)
    const pts = []
    for (let i = 0; i < 180; i++) {
      const a = p * i / 179
      pts.push([-1.5 + a * .75, radius * Math.sin(a)])
    }
    return pts.length > 1 ? pts : [[-1.5, 0], [-1.5, 0]]
  }, { stroke: BLUE, strokeWidth: .04 })
  const moving = new DynamicCircleSet((time) => {
    const a = scene.valueAt(phase, time)
    const x = cx + radius * Math.cos(a), y = cy + radius * Math.sin(a)
    return [[x, y, .1, YELLOW], [-1.5 + a * .75, y, .1, YELLOW]]
  })
  const connector = new DynamicLineSet((time) => {
    const a = scene.valueAt(phase, time), y = radius * Math.sin(a)
    const x = cx + radius * Math.cos(a)
    return [[x, y, -1.5 + a * .75, y, 'rgba(250,210,78,.5)', .018]]
  }, { worldStroke: true })
  scene.add(circle, curve, connector, moving)
  scene.animateValue(phase, { to: TAU * 1.35, duration: 7, easing: Easing.LINEAR })
  scene.wait(.4)
  return scene
}

export const manimScenes = [
  { id:'manim-logo', title:'Manim · ManimCELogo', source:'manim/gallery.py · ManimCELogo', width:1280, height:720, builder:manimCELogo, manimSection:'basic' , static:true},
  { id:'manim-brace', title:'Manim · BraceAnnotation', source:'manim/gallery.py · BraceAnnotation', width:1280, height:720, builder:braceAnnotation, manimSection:'basic' , static:true},
  { id:'manim-vector', title:'Manim · VectorArrow', source:'manim/gallery.py · VectorArrow', width:1280, height:720, builder:vectorArrow, manimSection:'basic' , static:true},
  { id:'manim-gradient', title:'Manim · GradientImageFromArray', source:'manim/gallery.py · GradientImageFromArray', width:1280, height:720, builder:gradientImageFromArray, manimSection:'basic' , static:true},
  { id:'manim-boolean', title:'Manim · BooleanOperations', source:'manim/gallery.py · BooleanOperations', width:1280, height:720, builder:booleanOperations, manimSection:'basic' },

  { id:'manim-point-shapes', title:'Manim · PointMovingOnShapes', source:'manim/gallery.py · PointMovingOnShapes', width:1280, height:720, builder:pointMovingOnShapes, manimSection:'animation' },
  { id:'manim-moving-around', title:'Manim · MovingAround', source:'manim/gallery.py · MovingAround', width:1280, height:720, builder:movingAround, manimSection:'animation' },
  { id:'manim-angle', title:'Manim · MovingAngle', source:'manim/gallery.py · MovingAngle', width:1280, height:720, builder:movingAngle, manimSection:'animation' },
  { id:'manim-dots', title:'Manim · MovingDots', source:'manim/gallery.py · MovingDots', width:1280, height:720, builder:movingDots, manimSection:'animation' },
  { id:'manim-group-destination', title:'Manim · MovingGroupToDestination', source:'manim/gallery.py · MovingGroupToDestination', width:1280, height:720, builder:movingGroupToDestination, manimSection:'animation' },
  { id:'manim-frame-box', title:'Manim · MovingFrameBox', source:'manim/gallery.py · MovingFrameBox', width:1280, height:720, builder:movingFrameBox, manimSection:'animation' },
  { id:'manim-rotation-updater', title:'Manim · RotationUpdater', source:'manim/gallery.py · RotationUpdater', width:1280, height:720, builder:rotationUpdater, manimSection:'animation' },
  { id:'manim-trace', title:'Manim · PointWithTrace', source:'manim/gallery.py · PointWithTrace', width:1280, height:720, builder:pointWithTrace, manimSection:'animation' },

  { id:'manim-sin-cos', title:'Manim · SinAndCosFunctionPlot', source:'manim/gallery.py · SinAndCosFunctionPlot', width:1280, height:720, builder:sinAndCosFunctionPlot, manimSection:'plotting' , static:true},
  { id:'manim-argmin', title:'Manim · ArgMinExample', source:'manim/gallery.py · ArgMinExample', width:1280, height:720, builder:argMinExample, manimSection:'plotting' },
  { id:'manim-area', title:'Manim · GraphAreaPlot', source:'manim/gallery.py · GraphAreaPlot', width:1280, height:720, builder:graphAreaPlot, manimSection:'plotting' , static:true},
  { id:'manim-polygon-axes', title:'Manim · PolygonOnAxes', source:'manim/gallery.py · PolygonOnAxes', width:1280, height:720, builder:polygonOnAxes, manimSection:'plotting' },
  { id:'manim-heat', title:'Manim · HeatDiagramPlot', source:'manim/gallery.py · HeatDiagramPlot', width:1280, height:720, builder:heatDiagramPlot, manimSection:'plotting' , static:true},

  { id:'manim-follow-camera', title:'Manim · FollowingGraphCamera', source:'manim/gallery.py · FollowingGraphCamera', width:1280, height:720, builder:followingGraphCamera, manimSection:'camera' },
  { id:'manim-zoom-camera', title:'Manim · MovingZoomedSceneAround', source:'manim/gallery.py · MovingZoomedSceneAround', width:1280, height:720, builder:movingZoomedSceneAround, manimSection:'camera' },
  { id:'manim-fixed-frame', title:'Manim · FixedInFrameMObjectTest', source:'manim/gallery.py · FixedInFrameMObjectTest', width:1280, height:720, builder:fixedInFrameMObjectTest, manimSection:'camera' , static:true},
  { id:'manim-light-source', title:'Manim · ThreeDLightSourcePosition', source:'manim/gallery.py · ThreeDLightSourcePosition', width:1280, height:720, builder:threeDLightSourcePosition, manimSection:'camera' , static:true},
  { id:'manim-3d-camera', title:'Manim · ThreeDCameraRotation', source:'manim/gallery.py · ThreeDCameraRotation', width:1280, height:720, builder:threeDCameraRotation, manimSection:'camera' },
  { id:'manim-3d-illusion', title:'Manim · ThreeDCameraIllusionRotation', source:'manim/gallery.py · ThreeDCameraIllusionRotation', width:1280, height:720, builder:threeDCameraIllusionRotation, manimSection:'camera' },
  { id:'manim-surface', title:'Manim · ThreeDSurfacePlot', source:'manim/gallery.py · ThreeDSurfacePlot', width:1280, height:720, builder:threeDSurfacePlot, manimSection:'camera' , static:true},

  { id:'manim-opening', title:'Manim · OpeningManim', source:'manim/gallery.py · OpeningManim', width:1280, height:720, builder:openingManim, manimSection:'advanced' },
  { id:'manim-sine-circle', title:'Manim · SineCurveUnitCircle', source:'manim/gallery.py · SineCurveUnitCircle', width:1280, height:720, builder:sineCurveUnitCircle, manimSection:'advanced' },
]
