import {
  Arc,
  Arrow,
  BLUE,
  Box3D,
  Brace,
  Camera3D,
  Circle,
  DynamicCircleSet,
  Difference,
  DynamicLineSet,
  DynamicPolyline,
  DynamicRectSet,
  DynamicTextSet,
  DynamicVectorObject2D,
  Dot,
  Ellipse,
  Exclusion,
  Easing,
  GREEN,
  Group,
  Image,
  Intersection,
  Line,
  LineSet,
  Math as ZMath,
  MeshObject3D,
  NumberPlane,
  ORANGE,
  PI,
  PINK,
  Polygon,
  ProjectedLineSet3D,
  ProjectedPolyline3D,
  Polyline,
  RegularPolygon,
  PURPLE,
  RED,
  Rectangle,
  Row,
  ScalarValue,
  Scene,
  Scene3DLayer,
  SceneViewport,
  Square,
  SurroundingRectangle,
  TAU,
  Text,
  TextSet,
  Typst,
  Transform2D,
  Transform3D,
  TriangleMesh,
  Union,
  Vec3,
  WHITE,
  YELLOW,
  prepareVectorMorph,
} from '@zanim/web'

const CYAN = '#69c8ff'
const MUTED = '#919eb8'
const BG = '#000000'
const M_BLUE = '#58C4DD'
const M_GREEN = '#83C167'
const M_RED = '#FC6255'
const M_ORANGE = '#FF862F'
const M_YELLOW = '#F7D96F'
const M_PINK = '#D147BD'
const M_PURPLE = '#9A72AC'
const M_WHITE = '#FFFFFF'
const M_GRAY = '#888888'
const M_MAROON = '#C55F73'
const M_GREEN_B = '#A6CF8C'
const M_YELLOW_B = '#FFEA94'
const M_YELLOW_D = '#F4D345'
const M_PURE_YELLOW = '#FFFF00'
const T = (x = 0, y = 0, rotation = 0, scale = 1) =>
  Transform2D.affine({ position: [x, y], rotation, scale })
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const lerp = (a, b, t) => a + (b - a) * t

async function makeScene(canvas, { unitSize = 90, background = BG } = {}) {
  const rect = canvas.getBoundingClientRect()
  const scale = Math.max(0.2, rect.width / 1280)
  return Scene.create(canvas, {
    fps: 60,
    renderer: { unitSize: unitSize * scale, background },
  })
}

function heading() {}

function dot(x, y, color = M_WHITE, radius = .08) {
  return new Circle(radius, { fill: color, stroke: null, transform: T(x, y), zIndex: 8 })
}

function manimEase() { return Easing.SMOOTH }

function bracePath(a, b, offset = -.28, depth = .18) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len, uy = dy / len
  const nx = -uy, ny = ux
  const p = (t, n) => [a[0] + dx * t + nx * n, a[1] + dy * t + ny * n]
  return [
    p(0, offset + depth), p(0, offset), p(.44, offset), p(.5, offset - depth),
    p(.56, offset), p(1, offset), p(1, offset + depth),
  ]
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

function plotAxes({
  xRange,
  yRange,
  width = 8,
  height = 5,
  center = [0, 0],
  xTicks = [],
  yTicks = [],
  color = M_GREEN,
  labelColor = M_WHITE,
  tickSize = .08,
}) {
  const [x0, x1] = xRange, [y0, y1] = yRange
  const [cx, cy] = center
  const sx = width / (x1 - x0), sy = height / (y1 - y0)
  const map = (x, y) => [cx + (x - (x0 + x1) / 2) * sx, cy + (y - (y0 + y1) / 2) * sy]
  const segments = []
  const labels = []
  let xAxisY = null, yAxisX = null

  if (y0 <= 0 && 0 <= y1) {
    const a = map(x0, 0), b = map(x1, 0)
    xAxisY = a[1]
    segments.push([a[0], a[1], b[0], b[1], color, .026])
    for (const x of xTicks) {
      const q = map(x, 0)
      segments.push([q[0], q[1] - tickSize, q[0], q[1] + tickSize, color, .022])
      labels.push([q[0], q[1] - .24, String(x), labelColor, 15, 500])
    }
  }

  if (x0 <= 0 && 0 <= x1) {
    const a = map(0, y0), b = map(0, y1)
    yAxisX = a[0]
    segments.push([a[0], a[1], b[0], b[1], color, .026])
    for (const y of yTicks) {
      const q = map(0, y)
      segments.push([q[0] - tickSize, q[1], q[0] + tickSize, q[1], color, .022])
      if (Math.abs(y) > 1e-9) labels.push([q[0] - .25, q[1], String(y), labelColor, 15, 500])
    }
  }

  return {
    map,
    sx,
    sy,
    xAxisY,
    yAxisX,
    axes: new LineSet(segments, { worldStroke: true }),
    labels: new TextSet(labels),
  }
}

function addAxisLabels(scene, axes, { x = 'x', y = 'y', fontSize = 24 } = {}) {
  if (axes.xAxisY != null) {
    const p = axes.map(axes.xRange?.[1] ?? 0, 0)
    void p
  }
  const [x0, x1] = axes._xRange ?? [0, 1]
  const [y0, y1] = axes._yRange ?? [0, 1]
  const labels = []
  if (axes.xAxisY != null) {
    const p = axes.map(x1, 0)
    labels.push(new Text(x, { fontSize, transform: T(p[0] + .28, p[1] - .02) }))
  }
  if (axes.yAxisX != null) {
    const p = axes.map(0, y1)
    labels.push(new Text(y, { fontSize, transform: T(p[0], p[1] + .28) }))
  }
  scene.add(...labels)
}

function withRanges(axes, xRange, yRange) {
  axes._xRange = xRange
  axes._yRange = yRange
  return axes
}

const MANIM_3D_FOCAL_DISTANCE = 20
const MANIM_3D_FRAME_HEIGHT = 8
const MANIM_3D_FOV_Y = 2 * Math.atan(
  (MANIM_3D_FRAME_HEIGHT / 2) / MANIM_3D_FOCAL_DISTANCE,
) * 180 / PI

function orbitCameraPosition(phi, theta, radius = 8) {
  const s = Math.sin(phi)
  return new Vec3(
    radius * s * Math.cos(theta),
    radius * s * Math.sin(theta),
    radius * Math.cos(phi),
  )
}

function manimCamera3D(phi, theta, options = {}) {
  return new Camera3D({
    position: orbitCameraPosition(phi, theta, MANIM_3D_FOCAL_DISTANCE),
    target: new Vec3(),
    up: new Vec3(0, 0, 1),
    fovYDegrees: MANIM_3D_FOV_Y,
    ...options,
  })
}

function arrowHeadMesh3D(length = .32, radius = .13) {
  const tip = new Vec3(length / 2, 0, 0)
  const bx = -length / 2
  const base = [
    new Vec3(bx, radius, 0),
    new Vec3(bx, 0, radius),
    new Vec3(bx, -radius, 0),
    new Vec3(bx, 0, -radius),
  ]
  const vertices = [], normals = [], indices = []
  const addTri = (a, b, c) => {
    const n = b.sub(a).cross(c.sub(a)).normalized()
    const k = vertices.length
    vertices.push(a, b, c)
    normals.push(n, n, n)
    indices.push(k, k + 1, k + 2)
  }
  for (let i = 0; i < 4; i++) {
    addTri(tip, base[i], base[(i + 1) % 4])
  }
  addTri(base[0], base[2], base[1])
  addTri(base[0], base[3], base[2])
  return new TriangleMesh(vertices, normals, indices)
}


function axisMeshes3D(length = { x: 10.5, y: 10.5, z: 6.5 }) {
  const xLength = typeof length === 'number' ? length : (length.x ?? 8)
  const yLength = typeof length === 'number' ? length : (length.y ?? 8)
  const zLength = typeof length === 'number' ? length : (length.z ?? 6)
  const color = M_WHITE
  const shaft = .018
  const tickLength = .13
  const tickWidth = .012
  const objects = [
    Box3D(new Vec3(xLength, shaft, shaft), { color }),
    Box3D(new Vec3(yLength, shaft, shaft), {
      color,
      transform: Transform3D.rotationZ(PI / 2),
    }),
    Box3D(new Vec3(zLength, shaft, shaft), {
      color,
      transform: Transform3D.rotationY(-PI / 2),
    }),
  ]

  const addTicks = (axis, total) => {
    const half = total / 2
    const maxTick = Math.floor(half - .05)
    for (let i = -maxTick; i <= maxTick; i++) {
      if (i === 0) continue
      if (axis === 'x') {
        objects.push(Box3D(new Vec3(tickWidth, tickLength, tickWidth), {
          color,
          transform: Transform3D.translation(i, 0, 0),
        }))
      } else if (axis === 'y') {
        objects.push(Box3D(new Vec3(tickLength, tickWidth, tickWidth), {
          color,
          transform: Transform3D.translation(0, i, 0),
        }))
      } else {
        objects.push(Box3D(new Vec3(tickLength, tickWidth, tickWidth), {
          color,
          transform: Transform3D.translation(0, 0, i),
        }))
      }
    }
  }
  addTicks('x', xLength)
  addTicks('y', yLength)
  addTicks('z', zLength)

  const arrowMesh = arrowHeadMesh3D()
  objects.push(
    new MeshObject3D(arrowMesh, {
      color,
      transform: Transform3D.translation(xLength / 2 + .12, 0, 0),
    }),
    new MeshObject3D(arrowMesh, {
      color,
      transform: Transform3D.translation(0, yLength / 2 + .12, 0)
        .mul(Transform3D.rotationZ(PI / 2)),
    }),
    new MeshObject3D(arrowMesh, {
      color,
      transform: Transform3D.translation(0, 0, zLength / 2 + .12)
        .mul(Transform3D.rotationY(-PI / 2)),
    }),
  )
  return objects
}

function projectedAxes3D(camera) {
  const xHalf = 10.5 / 2
  const yHalf = 10.5 / 2
  const zHalf = 6.5 / 2
  const manimPx = (renderer, px) => px * renderer.canvas.width / 854
  const axisStroke = (renderer) => manimPx(renderer, 2)
  const tickStroke = (renderer) => manimPx(renderer, 1.6)
  const tipSize = (renderer) => manimPx(renderer, 22)
  const tickHalf = .09

  const axes = [
    new ProjectedPolyline3D(
      [new Vec3(-xHalf, 0, 0), new Vec3(xHalf, 0, 0)],
      { camera, stroke: M_WHITE, strokeWidth: axisStroke, endTip: true, tipSize },
    ),
    new ProjectedPolyline3D(
      [new Vec3(0, -yHalf, 0), new Vec3(0, yHalf, 0)],
      { camera, stroke: M_WHITE, strokeWidth: axisStroke, endTip: true, tipSize },
    ),
    new ProjectedPolyline3D(
      [new Vec3(0, 0, -zHalf), new Vec3(0, 0, zHalf)],
      { camera, stroke: M_WHITE, strokeWidth: axisStroke, endTip: true, tipSize },
    ),
  ]

  const ticks = []
  // ThreeDAxes defaults:
  // x_range=(-6,6,1), y_range=(-5,5,1), z_range=(-4,4,1)
  // lengths=(10.5,10.5,6.5)
  for (let k = -5; k <= 5; k++) {
    if (k === 0) continue
    const x = k * 10.5 / 12
    ticks.push([new Vec3(x, -tickHalf, 0), new Vec3(x, tickHalf, 0)])
  }
  for (let k = -4; k <= 4; k++) {
    if (k === 0) continue
    const y = k * 10.5 / 10
    ticks.push([new Vec3(-tickHalf, y, 0), new Vec3(tickHalf, y, 0)])
  }
  for (let k = -3; k <= 3; k++) {
    if (k === 0) continue
    const z = k * 6.5 / 8
    ticks.push([new Vec3(-tickHalf, 0, z), new Vec3(tickHalf, 0, z)])
  }

  axes.push(new ProjectedLineSet3D(ticks, {
    camera,
    stroke: '#b8b8b8',
    strokeWidth: tickStroke,
  }))
  return axes
}

function projectedCircle3D(camera) {
  const points = []
  const segments = 160
  for (let i = 0; i <= segments; i++) {
    const a = TAU * i / segments
    points.push(new Vec3(Math.cos(a), Math.sin(a), 0))
  }
  return new ProjectedPolyline3D(points, {
    camera,
    stroke: M_WHITE,
    strokeWidth: (renderer) => 2.5 * renderer.canvas.width / 854,
    closed: true,
  })
}


function annulusMesh(inner = .96, outer = 1.04, segments = 72) {
  const vertices = [], normals = [], indices = []
  for (let i = 0; i < segments; i++) {
    const a = TAU * i / segments
    const b = TAU * (i + 1) / segments
    const base = vertices.length
    const points = [
      [inner * Math.cos(a), inner * Math.sin(a), 0],
      [outer * Math.cos(a), outer * Math.sin(a), 0],
      [outer * Math.cos(b), outer * Math.sin(b), 0],
      [inner * Math.cos(b), inner * Math.sin(b), 0],
    ]
    for (const q of points) {
      vertices.push(new Vec3(...q))
      normals.push(new Vec3(0, 0, 1))
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  return new TriangleMesh(vertices, normals, indices)
}

function sphereMesh(radius = 1.5, latSteps = 18, lonSteps = 36) {
  const vertices = [], normals = [], indices = []
  for (let i = 0; i <= latSteps; i++) {
    const phi = -PI / 2 + PI * i / latSteps
    const cp = Math.cos(phi), sp = Math.sin(phi)
    for (let j = 0; j <= lonSteps; j++) {
      const theta = TAU * j / lonSteps
      const n = new Vec3(cp * Math.cos(theta), cp * Math.sin(theta), sp)
      vertices.push(n.mul(radius))
      normals.push(n)
    }
  }
  const stride = lonSteps + 1
  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lonSteps; j++) {
      const a = i * stride + j, b = a + 1, c = a + stride, d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  return new TriangleMesh(vertices, normals, indices)
}

function sphereCheckerMesh(parity = 0, radius = 1.5, latSteps = 15, lonSteps = 32) {
  const vertices = [], normals = [], indices = []
  const point = (u, v) => {
    const n = new Vec3(
      Math.cos(u) * Math.cos(v),
      Math.cos(u) * Math.sin(v),
      Math.sin(u),
    )
    return [n.mul(radius), n]
  }
  for (let i = 0; i < latSteps; i++) {
    const u0 = -PI / 2 + PI * i / latSteps
    const u1 = -PI / 2 + PI * (i + 1) / latSteps
    for (let j = 0; j < lonSteps; j++) {
      if ((i + j) % 2 !== parity) continue
      const v0 = TAU * j / lonSteps
      const v1 = TAU * (j + 1) / lonSteps
      const [p00, n00] = point(u0, v0)
      const [p01, n01] = point(u0, v1)
      const [p11, n11] = point(u1, v1)
      const [p10, n10] = point(u1, v0)
      const base = vertices.length
      vertices.push(p00, p01, p11, p10)
      normals.push(n00, n01, n11, n10)
      // Match the rasterizer-facing winding used by sphereMesh().
      indices.push(base, base + 3, base + 1, base + 1, base + 3, base + 2)
    }
  }
  return new TriangleMesh(vertices, normals, indices)
}

function gaussianMesh(parity = 0, steps = 24) {
  const vertices = [], normals = [], indices = []
  const point = (u, v) => {
    const z = Math.exp(-(u * u + v * v) / (2 * .4 * .4))
    return new Vec3(2 * u, 2 * v, 2 * z)
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      if ((i + j) % 2 !== parity) continue
      const u0 = -2 + 4 * i / steps, u1 = -2 + 4 * (i + 1) / steps
      const v0 = -2 + 4 * j / steps, v1 = -2 + 4 * (j + 1) / steps
      const p00 = point(u0, v0), p10 = point(u1, v0), p11 = point(u1, v1), p01 = point(u0, v1)
      const tris = [[p00, p10, p11], [p00, p11, p01]]
      for (const tri of tris) {
        const base = vertices.length
        const n = tri[1].sub(tri[0]).cross(tri[2].sub(tri[0])).normalized()
        vertices.push(...tri)
        normals.push(n, n, n)
        indices.push(base, base + 1, base + 2)
      }
    }
  }
  return new TriangleMesh(vertices, normals, indices)
}

async function manimCELogo(canvas) {
  const scene = await makeScene(canvas, { background: '#ece6e2' })
  const dsM = new ZMath('bb(M)', {
    fontSize: 250,
    color: '#343434',
    transform: Transform2D.affine({
      position: [-2.25, 1.5],
      scale: [1, 1.04],
    }),
  })
  const circle = new Circle(1, { fill: '#87c2a5', stroke: '#87c2a5', width: 1.75 })
  circle.shift(-1, 0)
  const square = new Square(2, { fill: '#525893', stroke: '#525893', width: 1.75 })
  square.shift(0, 1)
  const triangle = new RegularPolygon(3, 1, { fill: '#e07a5f', stroke: '#e07a5f', width: 1.75 })
  triangle.shift(1, 0)
  const logo = new Group([triangle, square, circle, dsM])
  const c = logo.center
  logo.shift(-c.x, -c.y)
  scene.add(logo)
  return scene
}


async function braceAnnotation(canvas) {
  const scene = await makeScene(canvas)
  const a = [-2, -1], b = [2, 1]
  const line = new Line(a, b, { stroke: M_ORANGE })
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const length = Math.hypot(dx, dy)
  const normal = [-dy / length, dx / length]

  const lower = new Brace(line)
  const upper = new Brace(line, { direction: normal })

  const lowerLabel = lower.labelPoint()
  const upperLabel = upper.labelPoint()
  const label = new ZMath('"Horizontal distance"', {
    transform: T(lowerLabel.x, lowerLabel.y),
  })
  const tex = new ZMath('x - x_1', {
    transform: T(upperLabel.x, upperLabel.y),
  })

  scene.add(line, new Dot(a), new Dot(b), lower, upper, label, tex)
  return scene
}


async function vectorArrow(canvas) {
  const scene = await makeScene(canvas)
  const origin = new Dot([0, 0])
  const arrow = new Arrow([0, 0], [2, 2], { buff: 0 })
  const originText = new Text('(0, 0)').nextTo(origin, [0, -1])
  const tipText = new Text('(2, 2)').nextTo(arrow.end, [1, 0])

  scene.add(new NumberPlane(), origin, arrow, originText, tipText)
  return scene
}


async function gradientImageFromArray(canvas) {
  const scene = await makeScene(canvas)
  const base = import.meta.env.BASE_URL
  const image = new Image(base + 'assets/manim/gradient.png', { width: 4 })
  await image.ready
  const border = new SurroundingRectangle(image, { color: M_GREEN })
  scene.add(image, border)
  return scene
}


async function booleanOperations(canvas) {
  const scene = await makeScene(canvas)

  const ellipse1 = new Ellipse(2, 2.5, {
    fill: 'rgba(88,196,221,.50)',
    stroke: M_BLUE,
    strokeWidth: 10 / 90,
    opacity: 0,
    transform: T(-4, 0),
  })
  const ellipse2 = new Ellipse(2, 2.5, {
    fill: 'rgba(252,98,85,.50)',
    stroke: M_RED,
    strokeWidth: 10 / 90,
    opacity: 0,
    transform: T(-2, 0),
  })

  const title = new Text('Boolean Operation', {
    fontSize: 34,
    opacity: 0,
    transform: T(-3, 3.15),
  })
  const titleBounds = title.bounds()
  const underline = new Line(
    [titleBounds.left, titleBounds.bottom - .05],
    [titleBounds.right, titleBounds.bottom - .05],
    { stroke: M_WHITE, opacity: 0 },
  )

  const intersection = new Intersection(ellipse1, ellipse2, {
    color: M_GREEN,
    fillOpacity: .5,
  })
  const union = new Union(ellipse1, ellipse2, {
    color: M_ORANGE,
    fillOpacity: .5,
  })
  const exclusion = new Exclusion(ellipse1, ellipse2, {
    color: M_YELLOW,
    fillOpacity: .5,
  })
  const difference = new Difference(ellipse1, ellipse2, {
    color: M_PINK,
    fillOpacity: .5,
  })

  const intersectionText = new Text('Intersection', {
    fontSize: 23,
    opacity: 0,
    transform: T(5, 3.43),
  })
  const unionText = new Text('Union', {
    fontSize: 23,
    opacity: 0,
    transform: T(5, 1.29),
  })
  const exclusionText = new Text('Exclusion', {
    fontSize: 23,
    opacity: 0,
    transform: T(5, -1.11),
  })
  const differenceText = new Text('Difference', {
    fontSize: 23,
    opacity: 0,
    transform: T(2.5, 1.29),
  })

  scene.add(ellipse1, ellipse2, title, underline)
  scene.parallel(1, api => {
    api.fadeIn(ellipse1)
    api.fadeIn(ellipse2)
    api.fadeIn(title)
    api.fadeIn(underline)
  })

  scene.add(intersection)
  scene.affine(intersection, {
    position: [5, 2.5],
    scale: .25,
    duration: 1,
    easing: manimEase(),
  })
  scene.add(intersectionText)
  scene.fadeIn(intersectionText, { duration: 1, easing: manimEase() })

  scene.add(union)
  scene.affine(union, {
    position: [5, .15],
    scale: .30,
    duration: 1,
    easing: manimEase(),
  })
  scene.add(unionText)
  scene.fadeIn(unionText, { duration: 1, easing: manimEase() })

  scene.add(exclusion)
  scene.affine(exclusion, {
    position: [5, -2.25],
    scale: .30,
    duration: 1,
    easing: manimEase(),
  })
  scene.add(exclusionText)
  scene.fadeIn(exclusionText, { duration: 1, easing: manimEase() })

  scene.add(difference)
  scene.affine(difference, {
    position: [2.5, .15],
    scale: .30,
    duration: 1,
    easing: manimEase(),
  })
  scene.add(differenceText)
  scene.fadeIn(differenceText, { duration: 1, easing: manimEase() })

  return scene
}

async function pointMovingOnShapes(canvas) {
  const scene = await makeScene(canvas)

  const circle = new Circle(1, {
    fill: null,
    stroke: M_BLUE,
    transform: T(0, 0, 0, 0),
  })
  const dot = new Dot()
  const line = new Line([3, 0], [5, 0])

  scene.add(dot, line, circle)

  circle.affine({
    position: [0, 0],
    scale: 1,
    duration: 1,
    easing: manimEase(),
  })
  dot.move([1, 0], { duration: 1, easing: manimEase() })
  dot.moveAlong(circle, {
    duration: 2,
    easing: Easing.LINEAR,
  })
  dot.rotate(TAU, {
    about: [2, 0],
    duration: 1.5,
    easing: Easing.LINEAR,
  })

  scene.wait(1)
  return scene
}

async function movingAround(canvas) {
  const scene = await makeScene(canvas)
  const square = new Square(2, { fill: M_BLUE, stroke: M_BLUE })
  scene.add(square)
  scene.move(square, [-1, 0], { duration: 1, easing: manimEase() })
  scene.style(square, { to: { fill: M_ORANGE, stroke: M_BLUE }, duration: 1, easing: manimEase() })
  scene.scale(square, .3, { duration: 1, easing: manimEase() })
  scene.rotate(square, .4, { duration: 1, easing: manimEase() })
  return scene
}


async function movingAngle(canvas) {
  const scene = await makeScene(canvas)
  const theta = new ScalarValue(110 * PI / 180)
  scene.addValue(theta)
  const center = [-1, 0]
  const line1 = new Line([-1, 0], [1, 0], { stroke: M_WHITE })
  const moving = new DynamicLineSet((time) => {
    const a = scene.valueAt(theta, time)
    return [[-1, 0, -1 + 2 * Math.cos(a), 2 * Math.sin(a), M_WHITE]]
  }, { worldStroke: true })
  const angleArc = new DynamicPolyline((time) => {
    const a = scene.valueAt(theta, time)
    return Array.from({ length: 40 }, (_, i) => {
      const q = a * i / 39
      return [center[0] + .5 * Math.cos(q), center[1] + .5 * Math.sin(q)]
    })
  }, { stroke: M_WHITE })
  const thetaLabel = new DynamicTextSet((time) => {
    const a = scene.valueAt(theta, time)
    const q = a * .5
    return [[
      center[0] + .8 * Math.cos(q),
      center[1] + .8 * Math.sin(q),
      'θ',
      time < 3 ? M_WHITE : M_RED,
      48,
      400,
    ]]
  })
  scene.add(line1, moving, angleArc, thetaLabel)
  scene.wait(1)
  scene.animateValue(theta, { to: 40 * PI / 180, duration: 1, easing: manimEase() })
  scene.animateValue(theta, { to: 180 * PI / 180, duration: 1, easing: manimEase() })
  scene.wait(.5)
  scene.animateValue(theta, { to: 350 * PI / 180, duration: 1, easing: manimEase() })
  return scene
}


async function movingDots(canvas) {
  const scene = await makeScene(canvas)
  const x = new ScalarValue(0), y = new ScalarValue(0)
  scene.addValue(x); scene.addValue(y)
  const d2x = .58
  const dots = new DynamicCircleSet((time) => {
    const xv = scene.valueAt(x, time), yv = scene.valueAt(y, time)
    return [[xv, 0, .08, M_BLUE], [d2x, yv, .08, M_GREEN]]
  })
  const link = new DynamicLineSet((time) => {
    const xv = scene.valueAt(x, time), yv = scene.valueAt(y, time)
    return [[xv, 0, d2x, yv, M_RED]]
  })
  scene.add(dots, link)
  scene.animateValue(x, { to: 5, duration: 1, easing: manimEase() })
  scene.animateValue(y, { to: 4, duration: 1, easing: manimEase() })
  scene.wait(1)
  return scene
}


async function movingGroupToDestination(canvas) {
  const scene = await makeScene(canvas)
  const group = new Group([
    dot(-1.4, 0),
    dot(0, 0),
    dot(1.4, 0, M_RED),
    dot(2.8, 0),
  ])
  const dest = dot(4, 3, M_YELLOW)
  scene.add(group, dest)
  scene.move(group, [2.6, 3], { duration: 1, easing: manimEase() })
  scene.wait(.5)
  return scene
}


async function movingFrameBox(canvas) {
  const scene = await makeScene(canvas)

  const left = new ZMath('(d)/(d x) f(x) g(x) =', {
    fontSize: 38,
    reveal: 0,
  })
  const mid = new ZMath('f(x) (d)/(d x) g(x)', {
    fontSize: 38,
    reveal: 0,
  })
  const plus = new ZMath('+', {
    fontSize: 38,
    reveal: 0,
  })
  const right = new ZMath('g(x) (d)/(d x) f(x)', {
    fontSize: 38,
    reveal: 0,
  })

  // Math/Typst loads its precompiled SVG asynchronously. Layout and any
  // bounds-derived geometry must use the compiled document, not the temporary
  // 1x1 EMPTY_DOCUMENT visible immediately after construction.
  await Promise.all([left.ready, mid.ready, plus.ready, right.ready])

  new Row({ gap: .04, at: [0, 0] }).place(left, mid, plus, right)

  const framebox1 = new SurroundingRectangle(mid, {
    buff: .1,
    color: M_YELLOW,
    reveal: 0,
  })
  const framebox2 = new SurroundingRectangle(right, {
    buff: .1,
    color: M_YELLOW,
  })

  scene.add(left, mid, plus, right)
  scene.parallel(1, api => {
    api.create(left)
    api.create(mid)
    api.create(plus)
    api.create(right)
  })

  scene.add(framebox1)
  scene.create(framebox1, { duration: 1 })
  scene.wait(1)
  scene.replace(framebox1, framebox2, { duration: 1 })
  scene.wait(1)
  return scene
}

async function rotationUpdater(canvas) {
  const scene = await makeScene(canvas)
  const moving = new DynamicLineSet((time) => {
    let angle
    if (time <= 2) angle = time
    else if (time <= 4) angle = 4 - time
    else angle = 0
    return [[0, 0, -Math.cos(angle), -Math.sin(angle), M_YELLOW]]
  })
  scene.add(
    new Line([0, 0], [-1, 0], { stroke: M_WHITE }),
    moving,
  )
  scene.wait(4.5)
  return scene
}


async function pointWithTrace(canvas) {
  const scene = await makeScene(canvas)
  const dotAt = (time) => {
    if (time <= 2) {
      const a = PI * manimEase()(clamp01(time / 2))
      return [1 - Math.cos(a), -Math.sin(a)]
    }
    if (time <= 3) return [2, 0]
    if (time <= 4) return [2, manimEase()(time - 3)]
    if (time <= 5) return [2 - manimEase()(time - 4), 1]
    return [1, 1]
  }
  const traceAt = (time) => {
    const n = Math.max(2, Math.ceil(Math.min(time, 5) * 60))
    return Array.from({ length: n }, (_, i) => dotAt(Math.min(time, 5) * i / (n - 1)))
  }
  scene.add(
    new DynamicPolyline(traceAt, { stroke: M_WHITE }),
    new DynamicCircleSet((time) => {
      const p = dotAt(time)
      return [[p[0], p[1], .08, M_WHITE]]
    }),
  )
  scene.wait(6)
  return scene
}


async function sinAndCosFunctionPlot(canvas) {
  const scene = await makeScene(canvas)
  const xRange = [-10, 10.3], yRange = [-1.5, 1.5]
  const allXTicks = Array.from({ length: 21 }, (_, i) => i - 10)
  const axes = withRanges(plotAxes({
    xRange,
    yRange,
    width: 10,
    height: 6,
    xTicks: allXTicks,
    yTicks: [-1, 0, 1],
    color: M_GREEN,
    tickSize: .07,
  }), xRange, yRange)

  const sinPts = sampleGraph(Math.sin, -10, 10.3, 360, axes.map)
  const cosPts = sampleGraph(Math.cos, -10, 10.3, 360, axes.map)
  const tauPoint = axes.map(TAU, Math.cos(TAU))
  const tauBase = axes.map(TAU, 0)

  // Manim: every integer has a tick, even integers are elongated and numbered.
  const elongatedTicks = new LineSet(
    Array.from({ length: 11 }, (_, i) => -10 + 2 * i).map((x) => {
      const q = axes.map(x, 0)
      return [q[0], q[1] - .13, q[0], q[1] + .13, M_GREEN, .026]
    }),
    { worldStroke: true },
  )

  const numberLabel = (source, x) => {
    const q = axes.map(x, 0)
    return [q[0], q[1] - .38, source]
  }
  const n10 = numberLabel('-10', -10)
  const n8 = numberLabel('-8', -8)
  const n6 = numberLabel('-6', -6)
  const n4 = numberLabel('-4', -4)
  const n2 = numberLabel('-2', -2)
  const p2 = numberLabel('2', 2)
  const p4 = numberLabel('4', 4)
  const p6 = numberLabel('6', 6)
  const p8 = numberLabel('8', 8)
  const p10 = numberLabel('10', 10)
  const numberLabels = [
    new ZMath('-10', { fontSize: 24, color: M_WHITE, transform: T(n10[0], n10[1]) }),
    new ZMath('-8', { fontSize: 24, color: M_WHITE, transform: T(n8[0], n8[1]) }),
    new ZMath('-6', { fontSize: 24, color: M_WHITE, transform: T(n6[0], n6[1]) }),
    new ZMath('-4', { fontSize: 24, color: M_WHITE, transform: T(n4[0], n4[1]) }),
    new ZMath('-2', { fontSize: 24, color: M_WHITE, transform: T(n2[0], n2[1]) }),
    new ZMath('2', { fontSize: 24, color: M_WHITE, transform: T(p2[0], p2[1]) }),
    new ZMath('4', { fontSize: 24, color: M_WHITE, transform: T(p4[0], p4[1]) }),
    new ZMath('6', { fontSize: 24, color: M_WHITE, transform: T(p6[0], p6[1]) }),
    new ZMath('8', { fontSize: 24, color: M_WHITE, transform: T(p8[0], p8[1]) }),
    new ZMath('10', { fontSize: 24, color: M_WHITE, transform: T(p10[0], p10[1]) }),
  ]

  const sinPoint = axes.map(-10, Math.sin(-10))
  const cosPoint = axes.map(10.3, Math.cos(10.3))
  const xEnd = axes.map(xRange[1], 0)
  const yEnd = axes.map(0, yRange[1])

  const mathLabels = [
    ...numberLabels,
    new ZMath('x', {
      fontSize: 32,
      color: M_WHITE,
      transform: T(xEnd[0] + .42, xEnd[1] + .42),
    }),
    new ZMath('y', {
      fontSize: 32,
      color: M_WHITE,
      transform: T(yEnd[0] + .32, yEnd[1] + .25),
    }),
    new ZMath('sin(x)', {
      fontSize: 38,
      color: M_BLUE,
      transform: T(sinPoint[0], sinPoint[1] + .42),
    }),
    new ZMath('cos(x)', {
      fontSize: 38,
      color: M_RED,
      transform: T(cosPoint[0] + 1.05, cosPoint[1]),
    }),
    new ZMath('x = 2 pi', {
      fontSize: 34,
      color: M_WHITE,
      transform: T(tauPoint[0] + 1.05, tauPoint[1] + .40),
    }),
  ]
  await Promise.all(mathLabels.map((label) => label.ready))

  scene.add(
    axes.axes,
    elongatedTicks,
    new LineSet(polylineLines(sinPts, M_BLUE, .035), { worldStroke: true }),
    new LineSet(polylineLines(cosPts, M_RED, .035), { worldStroke: true }),
    new Line(tauBase, tauPoint, { stroke: M_YELLOW, strokeWidth: .03 }),
    ...mathLabels,
  )
  return scene
}

async function argMinExample(canvas) {
  const scene = await makeScene(canvas)
  const xRange = [0, 10], yRange = [0, 100]
  const axes = withRanges(plotAxes({
    xRange,
    yRange,
    width: 12,
    height: 6,
    xTicks: Array.from({ length: 11 }, (_, i) => i),
    yTicks: Array.from({ length: 11 }, (_, i) => i * 10),
    color: M_WHITE,
    tickSize: .07,
  }), xRange, yRange)
  const f = (x) => 2 * (x - 5) ** 2
  const graph = sampleGraph(f, 0, 10, 320, axes.map)
  const tracker = new ScalarValue(0)
  scene.addValue(tracker)

  const moving = new DynamicCircleSet((time) => {
    const x = scene.valueAt(tracker, time)
    const p = axes.map(x, f(x))
    return [[p[0], p[1], .08, M_WHITE]]
  }, { zIndex: 10 })

  const xEnd = axes.map(10, 0)
  const yEnd = axes.map(0, 100)
  const xLabel = new ZMath('x', {
    fontSize: 32,
    transform: T(xEnd[0] + .32, xEnd[1] + .18),
  })
  const yLabel = new ZMath('f(x)', {
    fontSize: 32,
    transform: T(yEnd[0] + .45, yEnd[1] + .28),
  })
  await Promise.all([xLabel.ready, yLabel.ready])

  scene.add(
    axes.axes,
    new LineSet(polylineLines(graph, M_MAROON, .04), { worldStroke: true }),
    moving,
    xLabel,
    yLabel,
  )
  scene.animateValue(tracker, { to: 5, duration: 1, easing: manimEase() })
  scene.wait(1)
  return scene
}


async function graphAreaPlot(canvas) {
  const scene = await makeScene(canvas)
  const xRange = [0, 5], yRange = [0, 6]
  const axes = withRanges(plotAxes({
    xRange,
    yRange,
    width: 12,
    height: 6,
    xTicks: [0, 1, 2, 3, 4, 5],
    yTicks: [0, 1, 2, 3, 4, 5, 6],
    color: M_WHITE,
    tickSize: .07,
  }), xRange, yRange)
  const f1 = (x) => 4 * x - x * x
  const f2 = (x) => .8 * x * x - 3 * x + 4
  const curve1 = sampleGraph(f1, 0, 4, 320, axes.map)
  const curve2 = sampleGraph(f2, 0, 4, 320, axes.map)

  const vertical = [2, 3].map((x) => {
    const a = axes.map(x, 0), b = axes.map(x, f1(x))
    return [a[0], a[1], b[0], b[1], M_PURE_YELLOW, .03]
  })

  const dx = .03
  const rects = []
  for (let x = .3; x < .6 - 1e-9; x += dx) {
    const h = f1(x)
    const a = axes.map(x, 0), b = axes.map(x + dx, h)
    rects.push([
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
      Math.abs(b[0] - a[0]),
      Math.abs(b[1] - a[1]),
      'rgba(88,196,221,.50)',
      M_BLUE,
      .008,
    ])
  }

  const top = sampleGraph(f1, 2, 3, 80, axes.map)
  const bottom = sampleGraph(f2, 2, 3, 80, axes.map).reverse()
  const area = new Polygon([...top, ...bottom], {
    fill: 'rgba(136,136,136,.50)',
    stroke: null,
    zIndex: -1,
  })

  const p2 = axes.map(2, 0), p3 = axes.map(3, 0)
  const xEnd = axes.map(5, 0), yEnd = axes.map(0, 6)
  const labels = [
    new ZMath('2', { fontSize: 24, transform: T(p2[0], p2[1] - .38) }),
    new ZMath('3', { fontSize: 24, transform: T(p3[0], p3[1] - .38) }),
    new ZMath('x', { fontSize: 32, transform: T(xEnd[0] + .34, xEnd[1] + .18) }),
    new ZMath('y', { fontSize: 32, transform: T(yEnd[0] + .28, yEnd[1] + .25) }),
  ]
  await Promise.all(labels.map((x) => x.ready))

  scene.add(
    axes.axes,
    new LineSet(polylineLines(curve1, M_BLUE, .035), { worldStroke: true }),
    new LineSet(polylineLines(curve2, M_GREEN_B, .035), { worldStroke: true }),
    new LineSet(vertical, { worldStroke: true }),
    new DynamicRectSet(() => rects, { zIndex: -1 }),
    area,
    ...labels,
  )
  return scene
}


async function polygonOnAxes(canvas) {
  const scene = await makeScene(canvas)
  const xRange = [0, 10], yRange = [0, 10]
  const allTicks = Array.from({ length: 11 }, (_, i) => i)
  const axes = withRanges(plotAxes({
    xRange,
    yRange,
    width: 6,
    height: 6,
    xTicks: allTicks,
    yTicks: allTicks,
    color: M_WHITE,
    tickSize: .07,
  }), xRange, yRange)
  const k = 25
  const graph = sampleGraph((x) => k / x, 2.5, 10, 420, axes.map)
  const tracker = new ScalarValue(5)
  scene.addValue(tracker)

  const polygon = new DynamicRectSet((time) => {
    const x = scene.valueAt(tracker, time), y = k / x
    const o = axes.map(0, 0), p = axes.map(x, y)
    return [[
      (o[0] + p[0]) / 2,
      (o[1] + p[1]) / 2,
      Math.abs(p[0] - o[0]),
      Math.abs(p[1] - o[1]),
      'rgba(88,196,221,.50)',
      M_YELLOW_B,
      1 / 90,
    ]]
  }, { opacity: 0, zIndex: -1, worldStroke: true })

  const moving = new DynamicCircleSet((time) => {
    const x = scene.valueAt(tracker, time)
    const p = axes.map(x, k / x)
    return [[p[0], p[1], .08, M_WHITE]]
  }, { zIndex: 10 })

  scene.add(
    axes.axes,
    new LineSet(polylineLines(graph, M_YELLOW_D, .035), { worldStroke: true }),
    polygon,
    moving,
  )
  scene.fadeIn(polygon, { duration: 1 })
  scene.animateValue(tracker, { to: 10, duration: 1, easing: manimEase() })
  scene.animateValue(tracker, { to: 2.5, duration: 1, easing: manimEase() })
  scene.animateValue(tracker, { to: 5, duration: 1, easing: manimEase() })
  return scene
}


async function heatDiagramPlot(canvas) {
  const scene = await makeScene(canvas)
  const xRange = [0, 40], yRange = [-8, 32]
  const xTicks = Array.from({ length: 9 }, (_, i) => i * 5)
  const yTicks = Array.from({ length: 8 }, (_, i) => -5 + i * 5)
  const axes = withRanges(plotAxes({
    xRange,
    yRange,
    width: 9,
    height: 6,
    xTicks,
    yTicks,
    color: M_WHITE,
    tickSize: .07,
  }), xRange, yRange)

  const values = [[0, 20], [8, 0], [38, 0], [39, -5]]
  const pts = values.map(([x, y]) => axes.map(x, y))

  const xp = xTicks.map((x) => axes.map(x, 0))
  const yp = yTicks.map((y) => axes.map(0, y))
  const numberLabels = [
    new ZMath('0', { fontSize: 24, transform: T(xp[0][0], xp[0][1] - .38) }),
    new ZMath('5', { fontSize: 24, transform: T(xp[1][0], xp[1][1] - .38) }),
    new ZMath('10', { fontSize: 24, transform: T(xp[2][0], xp[2][1] - .38) }),
    new ZMath('15', { fontSize: 24, transform: T(xp[3][0], xp[3][1] - .38) }),
    new ZMath('20', { fontSize: 24, transform: T(xp[4][0], xp[4][1] - .38) }),
    new ZMath('25', { fontSize: 24, transform: T(xp[5][0], xp[5][1] - .38) }),
    new ZMath('30', { fontSize: 24, transform: T(xp[6][0], xp[6][1] - .38) }),
    new ZMath('35', { fontSize: 24, transform: T(xp[7][0], xp[7][1] - .38) }),
    new ZMath('-5', { fontSize: 24, transform: T(yp[0][0] - .42, yp[0][1]) }),
    new ZMath('0', { fontSize: 24, transform: T(yp[1][0] - .36, yp[1][1]) }),
    new ZMath('5', { fontSize: 24, transform: T(yp[2][0] - .36, yp[2][1]) }),
    new ZMath('10', { fontSize: 24, transform: T(yp[3][0] - .42, yp[3][1]) }),
    new ZMath('15', { fontSize: 24, transform: T(yp[4][0] - .42, yp[4][1]) }),
    new ZMath('20', { fontSize: 24, transform: T(yp[5][0] - .42, yp[5][1]) }),
    new ZMath('25', { fontSize: 24, transform: T(yp[6][0] - .42, yp[6][1]) }),
    new ZMath('30', { fontSize: 24, transform: T(yp[7][0] - .42, yp[7][1]) }),
  ]

  const xEnd = axes.map(40, 0)
  const yEnd = axes.map(0, 32)
  const axisLabels = [
    new ZMath('Delta Q', {
      fontSize: 32,
      transform: T(xEnd[0] + .55, xEnd[1] + .18),
    }),
    new ZMath('T[degree C]', {
      fontSize: 32,
      transform: T(yEnd[0] + .62, yEnd[1] + .25),
    }),
  ]
  await Promise.all([...numberLabels, ...axisLabels].map((x) => x.ready))

  scene.add(
    axes.axes,
    new LineSet(polylineLines(pts, M_PURE_YELLOW, .035), { worldStroke: true }),
    new DynamicCircleSet(() => pts.map((p) => [p[0], p[1], .08, M_PURE_YELLOW])),
    ...numberLabels,
    ...axisLabels,
  )
  return scene
}


async function followingGraphCamera(canvas) {
  const scene = await makeScene(canvas)
  const xRange = [-1, 10], yRange = [-1, 10]
  const axes = withRanges(plotAxes({
    xRange, yRange, width: 8.4, height: 5.8,
    xTicks: [], yTicks: [], color: M_WHITE,
  }), xRange, yRange)
  const graph = sampleGraph(Math.sin, 0, 3 * PI, 360, axes.map)
  const tracker = new ScalarValue(0)
  scene.addValue(tracker)

  const moving = new DynamicCircleSet((time) => {
    const x = scene.valueAt(tracker, time)
    const p = axes.map(x, Math.sin(x))
    return [[p[0], p[1], .08, M_ORANGE]]
  }, { zIndex: 10 })

  const start = axes.map(0, 0), end = axes.map(3 * PI, Math.sin(3 * PI))
  scene.add(
    axes.axes,
    new LineSet(polylineLines(graph, M_BLUE, .04), { worldStroke: true }),
    dot(start[0], start[1]),
    dot(end[0], end[1]),
    moving,
  )

  const zoom = 2
  scene.camera.affine({
    position: [-zoom * start[0], -zoom * start[1]],
    scale: zoom,
    duration: 1,
    easing: manimEase(),
  })

  scene.parallel(2.4, (api) => {
    api.animateValue(tracker, { to: 3 * PI, easing: Easing.LINEAR })
    api.transformFunction(scene.camera, (alpha) => {
      const x = 3 * PI * alpha
      const p = axes.map(x, Math.sin(x))
      return Transform2D.affine({
        position: [-zoom * p[0], -zoom * p[1]],
        scale: zoom,
      })
    }, { easing: Easing.LINEAR })
  })

  scene.camera.affine({ position: [0, 0], scale: 1, duration: 1, easing: manimEase() })
  return scene
}


async function movingZoomedSceneAround(canvas) {
  const scene = await makeScene(canvas)

  // Exact synthetic image used by the Manim example:
  // np.uint8([[0, 100, 30, 200], [255, 0, 5, 33]])
  const pixels = document.createElement('canvas')
  pixels.width = 4
  pixels.height = 2
  const px = pixels.getContext('2d')
  const data = px.createImageData(4, 2)
  const values = [0, 100, 30, 200, 255, 0, 5, 33]
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    data.data[4 * i + 0] = v
    data.data[4 * i + 1] = v
    data.data[4 * i + 2] = v
    data.data[4 * i + 3] = 255
  }
  px.putImageData(data, 0, 0)

  const image = new Image(pixels.toDataURL(), {
    height: 7,
    zIndex: 0,
  })
  await image.ready

  const dotObj = new Dot([-2, 2], {
    color: M_WHITE,
    zIndex: 1,
  })

  // ZoomedScene(zoom_factor=.3, zoomed_display_width=6,
  //             zoomed_display_height=1)
  const sourceFrame = new Rectangle(1.8, .3, {
    fill: null,
    stroke: M_PURPLE,
    strokeWidth: 3 / 90,
    transform: T(-2, 2),
    reveal: 0,
    zIndex: 30,
  })
  const frameText = new Text('Frame', {
    color: M_PURPLE,
    fontSize: 34,
    opacity: 0,
    transform: T(-2, 1.55),
    zIndex: 31,
  })

  const sourceCenter = (time) => {
    const state = scene.stateAt(sourceFrame, time)
    return state.transform.apply(0, 0)
  }
  const sourceSize = (time) => {
    const m = scene.stateAt(sourceFrame, time).transform
    return [
      1.8 * Math.hypot(m.xx, m.yx),
      .3 * Math.hypot(m.xy, m.yy),
    ]
  }

  // Start collapsed exactly over the source frame. The pop-out animation
  // moves this real viewport to the independent zoomed-display position.
  const viewport = new SceneViewport({
    sourceCenter,
    sourceSize,
    width: 6,
    height: 1,
    transform: Transform2D.affine({
      position: [-2, 2],
      scale: .3,
    }),
    zIndex: 10,
  })
  const displayFrame = new Rectangle(6, 1, {
    fill: null,
    stroke: M_RED,
    strokeWidth: 6 / 90,
    transform: Transform2D.affine({
      position: [-2, 2],
      scale: .3,
    }),
    zIndex: 20,
  })
  const zoomText = new Text('Zoomed camera', {
    color: M_RED,
    fontSize: 34,
    opacity: 0,
    transform: T(3.6, 1.15),
    zIndex: 31,
  })

  scene.add(image, dotObj, sourceFrame, frameText)

  // 0..1: Create(frame), FadeIn(frame_text, shift=UP)
  scene.parallel(1, (api) => {
    api.create(sourceFrame)
    api.fadeIn(frameText)
  })

  // 1..2: activate_zooming + get_zoomed_display_pop_out_animation()
  scene.add(viewport, displayFrame)
  scene.parallel(1, (api) => {
    api.affine(viewport, {
      position: [3.6, 2],
      scale: 1,
    })
    api.affine(displayFrame, {
      position: [3.6, 2],
      scale: 1,
    })
  })

  // 2..3: FadeIn(zoomed_camera_text)
  scene.add(zoomText)
  scene.fadeIn(zoomText, { duration: 1 })

  // 3..4: frame/display scale([.5, 1.5]); labels fade away
  scene.parallel(1, (api) => {
    api.affine(sourceFrame, {
      position: [-2, 2],
      scale: [.5, 1.5],
    })
    api.affine(viewport, {
      position: [3.6, 2],
      scale: [.5, 1.5],
    })
    api.affine(displayFrame, {
      position: [3.6, 2],
      scale: [.5, 1.5],
    })
    api.fadeOut(zoomText)
    api.fadeOut(frameText)
  })

  // 4..5
  scene.wait(1)

  // 5..6: ScaleInPlace(zoomed_display, 2)
  scene.parallel(1, (api) => {
    api.affine(viewport, {
      position: [3.6, 2],
      scale: [1, 3],
    })
    api.affine(displayFrame, {
      position: [3.6, 2],
      scale: [1, 3],
    })
  })

  // 6..7
  scene.wait(1)

  // 7..8: frame.shift(2.5 * DOWN). viewport source follows frame state.
  scene.move(sourceFrame, [0, -2.5], {
    duration: 1,
    easing: manimEase(),
  })

  // 8..9
  scene.wait(1)

  // 9..10: reverse pop-out, collapse display onto the current source frame.
  scene.parallel(1, (api) => {
    api.affine(viewport, {
      position: [-2, -.5],
      scale: [.15, .45],
    })
    api.affine(displayFrame, {
      position: [-2, -.5],
      scale: [.15, .45],
    })
  })

  // 10..11: Uncreate(display frame), FadeOut(source frame).
  scene.parallel(1, (api) => {
    api.fadeOut(sourceFrame)
    api.fadeOut(viewport)
  })
  displayFrame.trimTo(0, { duration: 1, at: -1 })

  // 11..12
  scene.wait(1)
  return scene
}

async function fixedInFrameMObjectTest(canvas) {
  const scene = await makeScene(canvas)
  const camera = manimCamera3D(75 * PI / 180, -45 * PI / 180)
  scene.interactiveCamera3D = camera
  const axes = projectedAxes3D(camera)
  const label = new Text('This is a 3D text', {
    fontSize: 48,
    transform: T(-4.35, 3.05),
    zIndex: 20,
  })
  scene.add(...axes, label)
  scene.wait(1)
  return scene
}


async function threeDLightSourcePosition(canvas) {
  const scene = await makeScene(canvas)
  const camera = manimCamera3D(75 * PI / 180, 30 * PI / 180)
  scene.interactiveCamera3D = camera

  // Manim Surface(... checkerboard_colors=[RED_D, RED_E],
  // resolution=(15, 32)); light_source.move_to(3 * IN).
  const redD = new MeshObject3D(
    sphereCheckerMesh(0, 1.5, 15, 32),
    { color: '#E65A4C' },
  )
  const redE = new MeshObject3D(
    sphereCheckerMesh(1, 1.5, 15, 32),
    { color: '#CF5044' },
  )
  const axes3d = axisMeshes3D()
  const layer = new Scene3DLayer(
    [...axes3d, redD, redE],
    {
      camera,
      lightPosition: new Vec3(0, 0, -3),
      ambientLight: 1.05,
      diffuseLight: 1.5,
      resolution: 1,
    },
  )
  scene.add(layer)
  return scene
}


async function threeDCameraRotation(canvas) {
  const scene = await makeScene(canvas)
  const phi = 75 * PI / 180, theta0 = 30 * PI / 180
  const camera = manimCamera3D(phi, theta0, {
    position: (time) => {
      let theta
      if (time <= 1) {
        theta = theta0 + .1 * time
      } else if (time <= 2) {
        theta = lerp(theta0 + .1, theta0, manimEase()(time - 1))
      } else {
        theta = theta0
      }
      return orbitCameraPosition(phi, theta, MANIM_3D_FOCAL_DISTANCE)
    },
  })
  scene.interactiveCamera3D = camera
  const circle = projectedCircle3D(camera)
  const axes = projectedAxes3D(camera)
  scene.add(circle, ...axes)
  scene.wait(3)
  return scene
}


async function threeDCameraIllusionRotation(canvas) {
  const scene = await makeScene(canvas)
  const phi0 = 75 * PI / 180, theta0 = 30 * PI / 180
  const duration = PI / 2
  const camera = manimCamera3D(phi0, theta0, {
    position: (time) => {
      const t = Math.min(time, duration)
      const phase = 2 * t
      const phi = phi0 + .16 * Math.sin(phase)
      const theta = theta0 + .22 * (1 - Math.cos(phase))
      return orbitCameraPosition(phi, theta, MANIM_3D_FOCAL_DISTANCE)
    },
  })
  scene.interactiveCamera3D = camera
  const circle = projectedCircle3D(camera)
  const axes = projectedAxes3D(camera)
  scene.add(circle, ...axes)
  scene.wait(duration)
  return scene
}


async function threeDSurfacePlot(canvas) {
  const scene = await makeScene(canvas)
  const camera = manimCamera3D(75 * PI / 180, -30 * PI / 180)
  scene.interactiveCamera3D = camera
  const orange = new MeshObject3D(gaussianMesh(0, 24), { color: M_ORANGE, opacity: .5 })
  const blue = new MeshObject3D(gaussianMesh(1, 24), { color: M_BLUE, opacity: .5 })
  const layer = new Scene3DLayer([orange, blue], { camera, resolution: 1 })
  scene.add(layer, ...projectedAxes3D(camera))
  return scene
}


async function openingManim(canvas) {
  const scene = await makeScene(canvas)

  const serif = '"New Computer Modern", "Times New Roman", serif'
  const titleSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 46pt, fill: rgb("#ffffff"))\n#text("This is some LaTeX")')
  const transformedTitleSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 48pt, fill: rgb("#ffffff"))\n#text("That was a transform")')
  const gridTitleSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 72pt, fill: rgb("#ffffff"))\n#text("This is a grid")')
  const nonlinearTitleSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 48pt, fill: rgb("#ffffff"))\n#stack(dir: ttb, spacing: 2pt, align(left)[That was a non-linear function], align(left)[applied to the grid])')
  const formula = new ZMath('sum_(n=1)^infinity 1/n^2 = pi^2/6', {
    fontSize: 40,
    opacity: 0,
    transform: T(0, -1.45),
    zIndex: 12,
  })
  await Promise.all([
    titleSource.ready,
    transformedTitleSource.ready,
    gridTitleSource.ready,
    nonlinearTitleSource.ready,
    formula.ready,
  ])

  const titleMorph = prepareVectorMorph(
    titleSource.document,
    transformedTitleSource.document,
  )
  const title = new DynamicVectorObject2D((time) => {
    if (time <= 3) return titleSource.document
    if (time >= 4) return transformedTitleSource.document
    return titleMorph.sample(manimEase()(time - 3))
  }, {
    reveal: 0,
    transform: T(0, .65),
    zIndex: 12,
  })

  const gridTitleMorph = prepareVectorMorph(
    gridTitleSource.document,
    nonlinearTitleSource.document,
  )
  const gridTitle = new DynamicVectorObject2D((time) => {
    if (time <= 13) return gridTitleSource.document
    if (time >= 14) return nonlinearTitleSource.document
    return gridTitleMorph.sample(manimEase()(time - 13))
  }, {
    opacity: 0,
    transform: T(-4.35, 3.08),
    zIndex: 12,
  })

  // Manim NumberPlane defaults: one faded line between adjacent major lines,
  // BLUE_D major lines, half-opacity/half-width faded lines, white axes.
  const xMin = -7.2, xMax = 7.2, yMin = -4.05, yMax = 4.05
  const paths = []
  const addVertical = (x, color, width) => {
    const points = Array.from({ length: 82 }, (_, i) => [
      x,
      yMin + (yMax - yMin) * i / 81,
    ])
    paths.push({ points, color, width })
  }
  const addHorizontal = (y, color, width) => {
    const points = Array.from({ length: 146 }, (_, i) => [
      xMin + (xMax - xMin) * i / 145,
      y,
    ])
    paths.push({ points, color, width })
  }
  for (let x = -7; x <= 7; x++) {
    if (x !== 0) addVertical(x, '#236B8E', 3 / 90)
  }
  for (let x = -6.5; x <= 6.5; x += 1) {
    addVertical(x, 'rgba(35,107,142,.5)', 1.5 / 90)
  }
  for (let y = -4; y <= 4; y++) {
    if (y !== 0) addHorizontal(y, '#236B8E', 3 / 90)
  }
  for (let y = -3.5; y <= 3.5; y += 1) {
    addHorizontal(y, 'rgba(35,107,142,.5)', 1.5 / 90)
  }
  addHorizontal(0, M_WHITE, 3 / 90)
  addVertical(0, M_WHITE, 3 / 90)

  const gridReveal = new ScalarValue(0)
  const gridDeform = new ScalarValue(0)
  scene.addValue(gridReveal)
  scene.addValue(gridDeform)

  let finalGridItems = null
  const gridItemsProvider = (time) => {
    const reveal = scene.valueAt(gridReveal, time)
    const deform = scene.valueAt(gridDeform, time)
    if (reveal >= 1 - 1e-9 && deform >= 1 - 1e-9 && finalGridItems) {
      return finalGridItems
    }
    const items = []
    const lineCount = paths.length
    const lag = .1
    const total = 1 + lag * (lineCount - 1)
    paths.forEach((path, pathIndex) => {
      const localReveal = clamp01(reveal * total - lag * pathIndex)
      if (localReveal <= 0) return
      const transformed = path.points.map(([x, y]) => {
        const tx = x + Math.sin(y)
        const ty = y + Math.sin(x)
        return [lerp(x, tx, deform), lerp(y, ty, deform)]
      })
      const segmentCount = transformed.length - 1
      const visible = localReveal * segmentCount
      const whole = Math.min(segmentCount, Math.floor(visible))
      const fraction = clamp01(visible - whole)
      for (let i = 0; i < whole; i++) {
        const a = transformed[i], b = transformed[i + 1]
        items.push([a[0], a[1], b[0], b[1], path.color, path.width])
      }
      if (whole < segmentCount && fraction > 1e-9) {
        const a = transformed[whole], b = transformed[whole + 1]
        items.push([
          a[0],
          a[1],
          lerp(a[0], b[0], fraction),
          lerp(a[1], b[1], fraction),
          path.color,
          path.width,
        ])
      }
    })
    const result = items.length
      ? items
      : [[0, 0, 1e-9, 0, 'rgba(0,0,0,0)', 1 / 90]]
    if (reveal >= 1 - 1e-9 && deform >= 1 - 1e-9) finalGridItems = result
    return result
  }
  const grid = new DynamicLineSet(gridItemsProvider, { zIndex: 0 })

  // 0..2: Write(title) + FadeIn(formula, shift=DOWN)
  scene.add(title, formula)
  scene.parallel(2, (api) => {
    api.create(title)
    api.fadeIn(formula)
    api.animate(formula, { transform: T(0, -1.05) })
  })

  // 2..3
  scene.wait(1)

  // 3..4: Transform title to upper-left; formula leaves downward.
  scene.parallel(1, (api) => {
    api.animate(title, { transform: T(-4.25, 3.08) })
    api.fadeOut(formula)
    api.animate(formula, { transform: T(0, -1.45) })
  })

  // 4..5
  scene.wait(1)

  // 5..8: official NumberPlane creation is the long animation in this play.
  scene.add(grid, gridTitle)
  scene.parallel(3, (api) => {
    api.animateValue(gridReveal, { to: 1, easing: Easing.LINEAR })
    api.fadeOut(title, { duration: 1 })
    api.fadeIn(gridTitle, { duration: 1 })
  })

  // 8..9
  scene.wait(1)

  // 9..12: the actual nonlinear map p + [sin(y), sin(x)].
  scene.animateValue(gridDeform, {
    to: 1,
    duration: 3,
    easing: manimEase(),
  })

  // 12..13
  scene.wait(1)

  // 13..14: document provider performs the title morph.
  scene.wait(1)

  // 14..15
  scene.wait(1)
  return scene
}


async function sineCurveUnitCircle(canvas) {
  const scene = await makeScene(canvas)

  const xAxis = new Line([-6, 0], [6, 0], {
    stroke: M_WHITE,
    strokeWidth: 4 / 90,
  })
  const yAxis = new Line([-4, -2], [-4, 2], {
    stroke: M_WHITE,
    strokeWidth: 4 / 90,
  })
  const circle = new Circle(1, {
    fill: null,
    stroke: M_WHITE,
    strokeWidth: 4 / 90,
    transform: T(-4, 0),
  })
  const labels = [
    new ZMath('pi', { fontSize: 48, transform: T(-1, -.45) }),
    new ZMath('2 pi', { fontSize: 48, transform: T(1, -.45) }),
    new ZMath('3 pi', { fontSize: 48, transform: T(3, -.45) }),
    new ZMath('4 pi', { fontSize: 48, transform: T(5, -.45) }),
  ]
  await Promise.all(labels.map((label) => label.ready))

  // Match Manim's updater exactly:
  // t_offset += dt * .25, so phase = TAU * t_offset and
  // curve x = -3 + 4 * t_offset.
  const offset = new ScalarValue(0)
  scene.addValue(offset)

  const dot = new DynamicCircleSet((time) => {
    const u = scene.valueAt(offset, time)
    const a = TAU * (u % 1)
    return [[-4 + Math.cos(a), Math.sin(a), .08, M_PURE_YELLOW]]
  }, { zIndex: 8 })

  const radial = new DynamicLineSet((time) => {
    const u = scene.valueAt(offset, time)
    const a = TAU * (u % 1)
    const x = -4 + Math.cos(a), y = Math.sin(a)
    return [[-4, 0, x, y, M_BLUE, 4 / 90]]
  }, { zIndex: 2 })

  const connector = new DynamicLineSet((time) => {
    const u = scene.valueAt(offset, time)
    const a = TAU * (u % 1)
    const x = -4 + Math.cos(a), y = Math.sin(a)
    const curveX = -3 + 4 * u
    return [[x, y, curveX, y, '#FFF1B6', 2 / 90]]
  }, { zIndex: 3 })

  const curve = new DynamicPolyline((time) => {
    const end = scene.valueAt(offset, time)
    if (end <= 1e-9) return [[-3, 0], [-3, 0]]
    const count = Math.max(2, Math.ceil(end * 240))
    return Array.from({ length: count }, (_, i) => {
      const u = end * i / (count - 1)
      return [-3 + 4 * u, Math.sin(TAU * u)]
    })
  }, {
    stroke: M_YELLOW_D,
    strokeWidth: 4 / 90,
    zIndex: 4,
  })

  scene.add(xAxis, yAxis, ...labels, circle, dot, radial, connector, curve)
  scene.animateValue(offset, {
    to: 8.5 * .25,
    duration: 8.5,
    easing: Easing.LINEAR,
  })
  scene.wait(1)
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
  { id:'manim-fixed-frame', title:'Manim · FixedInFrameMObjectTest', source:'manim/gallery.py · FixedInFrameMObjectTest', width:1280, height:720, builder:fixedInFrameMObjectTest, manimSection:'camera' , static:true, orbit3d:true},
  { id:'manim-light-source', title:'Manim · ThreeDLightSourcePosition', source:'manim/gallery.py · ThreeDLightSourcePosition', width:1280, height:720, builder:threeDLightSourcePosition, manimSection:'camera' , static:true, orbit3d:true},
  { id:'manim-3d-camera', title:'Manim · ThreeDCameraRotation', source:'manim/gallery.py · ThreeDCameraRotation', width:1280, height:720, builder:threeDCameraRotation, manimSection:'camera' , orbit3d:true},
  { id:'manim-3d-illusion', title:'Manim · ThreeDCameraIllusionRotation', source:'manim/gallery.py · ThreeDCameraIllusionRotation', width:1280, height:720, builder:threeDCameraIllusionRotation, manimSection:'camera' , orbit3d:true},
  { id:'manim-surface', title:'Manim · ThreeDSurfacePlot', source:'manim/gallery.py · ThreeDSurfacePlot', width:1280, height:720, builder:threeDSurfacePlot, manimSection:'camera' , static:true, orbit3d:true},

  { id:'manim-opening', title:'Manim · OpeningManim', source:'manim/gallery.py · OpeningManim', width:1280, height:720, builder:openingManim, manimSection:'advanced' },
  { id:'manim-sine-circle', title:'Manim · SineCurveUnitCircle', source:'manim/gallery.py · SineCurveUnitCircle', width:1280, height:720, builder:sineCurveUnitCircle, manimSection:'advanced' },
]
