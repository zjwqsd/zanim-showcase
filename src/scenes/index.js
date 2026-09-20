import { neuralForwardPass } from './neuralForwardPass.js'
import { janimApiScenes } from './janimApi.js'
import {
  Arrow,
  BLUE,
  BOTTOM,
  CYAN,
  Circle,
  CircleSet,
  Column,
  ComplexMappedGrid,
  DOWN,
  DynamicCircleSet,
  DynamicLineSet,
  DynamicNumber,
  DynamicTextSet,
  DynamicPolyline,
  Easing,
  GIF,
  GREEN,
  Grid,
  Group,
  Image,
  InfiniteGrid,
  InfiniteLine,
  JuliaSet,
  LEFT_CENTER,
  LOCAL,
  Line,
  LineSet,
  MandelbrotSet,
  Math as ZMath,
  MUTED,
  ORANGE,
  PARENT,
  PINK,
  PI,
  PURPLE,
  Polygon,
  Polyline,
  RED,
  RIGHT_CENTER,
  Row,
  ScalarValue,
  Scene,
  Square,
  TAU,
  TOP,
  Text,
  Transform2D,
  Vec2,
  Video,
  Audio,
  VectorObject2D,
  WHITE,
  WORLD,
  YELLOW,
  RegularPolygon,
  Rectangle,
  FunctionPlot,
  FourierEpicycles,
  X,
} from '@zanim/web'

const T = (x = 0, y = 0, rotation = 0, scale = 1, shear = [0, 0]) =>
  Transform2D.affine({ position: [x, y], rotation, scale, shear })
const clamp01 = (x) => globalThis.Math.max(0, globalThis.Math.min(1, x))
const smooth = Easing.SMOOTHSTEP
const alpha = (hex, a) => `${hex.slice(0, 7)}${globalThis.Math.round(a).toString(16).padStart(2, '0')}`
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

function vectorColorCSS(value) {
  if (value == null || typeof value === 'string') return value
  const [r, g, b, a = 255] = value.map(Number)
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`
}

function webVectorDocument(raw) {
  return {
    width: Number(raw.width),
    height: Number(raw.height),
    group_count: Number(raw.group_count ?? 1),
    paths: raw.paths.map((path) => ({
      ...path,
      fill: vectorColorCSS(path.fill),
      stroke: path.stroke ? { ...path.stroke, color: vectorColorCSS(path.stroke.color) } : null,
    })),
  }
}

async function makeScene(canvas, spec) {
  const rect = canvas.getBoundingClientRect()
  const scale = globalThis.Math.max(0.2, rect.width / spec.width)
  return Scene.create(canvas, {
    fps: spec.fps ?? 60,
    renderer: { unitSize: spec.unitSize * scale, background: '#080b12' },
  })
}

function moveTo(object, point) {
  const c = object.center
  object.shift(point[0] - c.x, point[1] - c.y)
  return object
}

function header(scene, title, subtitle = '', { y = 3.15 } = {}) {
  const h = new Text(title, { fontSize: 34, transform: T(0, y), zIndex: 20 })
  scene.add(h)
  if (subtitle) scene.add(new Text(subtitle, { fontSize: 19, color: MUTED, transform: T(0, y - 0.45), zIndex: 20 }))
  return h
}

function circleItems(count, phase = 0) {
  const items = []
  for (let i = 0; i < count; i++) {
    const u = i / count
    const angle = TAU * (u * 5 + phase)
    const radius = 0.8 + 3 * u
    const dot = 0.025 + 0.055 * (0.5 + 0.5 * globalThis.Math.sin(5 * TAU * u + phase * TAU * 2))
    const r = globalThis.Math.round(70 + 170 * u)
    const g = globalThis.Math.round(145 + 70 * (1 - u))
    items.push([radius * globalThis.Math.cos(angle), radius * globalThis.Math.sin(angle), dot, `rgba(${r},${g},255,.86)`])
  }
  return items
}

function radialLines(count, phase = 0) {
  const items = []
  for (let i = 0; i < count; i++) {
    const u = i / count
    const a = TAU * u
    const b = a + phase * PI
    items.push([
      2 * globalThis.Math.cos(a), 2 * globalThis.Math.sin(a), 3.5 * globalThis.Math.cos(b), 3.5 * globalThis.Math.sin(b),
      `rgba(100,${globalThis.Math.round(140 + 100 * u)},255,.39)`, 0.006,
    ])
  }
  return items
}

async function basics(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 90 })
  const title = new Text('Objects define; Scene owns time', { fontSize: 34, opacity: 0 })
  const subtitle = new Text('Scene = initial + authored head + timeline', { fontSize: 27, color: '#aab9d7', opacity: 0 })
  const square = new Square(1.25, { fill: alpha(BLUE, 185), stroke: '#dce8ff', trim: 0 })
  const circle = new Circle(0.68, { fill: alpha(ORANGE, 185), stroke: '#dce8ff', trim: 0 })
  const dot = new Circle(0.11, { fill: '#ffe370', stroke: null, opacity: 0, zIndex: 5 })
  const shapes = new Group([square, circle, dot])
  new Row({ gap: 0.7, at: [0, 0.85] }).place(...shapes.children)

  const baseline = new Line([-4, -2.15], [4, -2.15], { stroke: '#91a0bc', width: 2 })
  const ticks = new LineSet(Array.from({ length: 9 }, (_, i) => {
    const x = -4 + i
    return [x, -2.25, x, -2.05, '#91a0bc', 0.018]
  }), { worldStroke: true })
  const numberLine = new Group([baseline, ticks], { zIndex: -2 })
  const arrow = new Arrow([-3.2, -1.3], [3.2, -1.3], { stroke: GREEN, width: 4, zIndex: 1 })
  const stage = new Group([numberLine, shapes, arrow])
  moveTo(title, [0, 3.25]); moveTo(subtitle, [0, 2.72])
  scene.add(stage, title, subtitle)

  scene.parallel((api) => {
    api.fadeIn(title, { duration: 0.8 })
    api.fadeIn(subtitle, { duration: 0.9, at: 0.15 })
    api.create(square, { duration: 1.2 })
    api.create(circle, { duration: 1.2, at: 0.15 })
    api.fadeIn(dot, { duration: 0.6, at: 0.7 })
  })
  scene.parallel(1.6, (api) => {
    api.move(shapes, [0.8, 0.25], { frame: WORLD })
    api.style(square, { to: { fill: alpha(GREEN, 205), stroke: '#dcfff0', width: 0.06, worldStroke: true } })
    api.move(arrow, [0.15, 0.1], { frame: WORLD })
  })
  const shapesCenter = scene.authoredCenter(shapes)
  scene.rotate(shapes, 0.18, { about: [shapesCenter.x, shapesCenter.y], duration: 0.8 })
  scene.scale(shapes, 1.08, { about: [shapesCenter.x, shapesCenter.y], duration: 0.6 })
  scene.camera.affine({ position: [-0.3, -0.08], scale: 1.15, duration: 1.3 })
  scene.fadeOut(stage, { duration: 0.9 })
  scene.wait(0.3)
  return scene
}

async function stateModel(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 92 })
  const title = new Text('One definition, two kinds of state', { fontSize: 36, transform: T(0, 3.35) })
  const rule = new Text('raw object = initial definition; Scene owns authored head', { fontSize: 23, color: MUTED, transform: T(0, 2.82) })
  const immediate = new Square(1.25, { fill: BLUE, stroke: null })
  const hidden = new Circle(0.68, { fill: GREEN, stroke: null, opacity: 0 })
  const drawn = new Square(1.25, { fill: null, stroke: PURPLE, strokeWidth: 0.055, trim: 0 })
  new Row({ gap: 2.7, at: [0, 0.6] }).place(immediate, hidden, drawn)
  const labels = [
    new Text('add() = visible now', { fontSize: 22, color: MUTED }),
    new Text('opacity=0; fade_in()', { fontSize: 22, color: MUTED }),
    new Text('trim=0; create()', { fontSize: 22, color: MUTED }),
  ]
  for (let i = 0; i < 3; i++) moveTo(labels[i], [i === 0 ? -4.0 : i === 1 ? 0 : 4.0, -0.82])
  scene.add(title, rule, immediate, hidden, drawn, ...labels)
  scene.wait(1.2)
  scene.parallel((api) => { api.fadeIn(hidden); api.create(drawn) })
  scene.wait(0.8)
  const late = new Circle(0.36, { fill: ORANGE, stroke: null, transform: T(0, -2.45) })
  const note = new Text('wait(); add() → lifetime starts here', { fontSize: 21, color: ORANGE, transform: T(2.8, -2.43) })
  scene.add(late, note)
  scene.wait(1)
  scene.remove(immediate)
  scene.add(new Text('remove() → absent from later snapshots', { fontSize: 21, color: RED, transform: T(-0.62, 0.6) }))
  scene.wait(1.2)
  return scene
}

async function layout(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 90 })
  header(scene, 'Declare → layout → animate', 'layout is an explicit target, not a persistent constraint', { y: 3.28 })
  const stroke = '#e1ebff'
  const square = new Square(1, { fill: alpha(BLUE, 185), stroke })
  const circle = new Circle(0.55, { fill: alpha(ORANGE, 185), stroke })
  const triangle = new RegularPolygon(3, 0.68, { fill: alpha(GREEN, 185), stroke })
  const card = new Rectangle(1.35, 0.82, { fill: alpha(PURPLE, 185), stroke })
  const group = new Group([square, circle, triangle, card])
  const center = [0, -0.35]
  new Row({ gap: 0.75, at: center }).place(...group.children)
  scene.add(group); scene.wait(0.7)
  const circleCenter = scene.authoredCenter(circle), triangleCenter = scene.authoredCenter(triangle)
  scene.parallel(1.2, (api) => {
    api.move(square, [-1.5, 1], { frame: WORLD })
    api.rotate(circle, 0.9, { about: [circleCenter.x, circleCenter.y] })
    api.scale(triangle, 1.45, { about: [triangleCenter.x, triangleCenter.y] })
    api.move(card, [1.3, -0.9], { frame: WORLD })
  })
  scene.wait(0.35)
  scene.layout(square, circle, triangle, card, { to: new Row({ gap: 0.75, at: center }), duration: 1 })
  scene.wait(0.3)
  scene.layout(square, circle, triangle, card, { to: new Grid({ rows: 2, cols: 2, gap: [0.9, 0.65], at: center }), duration: 1.1 })
  scene.wait(0.3)
  scene.layout(square, circle, triangle, card, { to: new Column({ gap: 0.38, at: center }), duration: 1.1 })
  scene.wait(0.3)
  scene.layout(square, circle, triangle, card, { to: new Row({ gap: 0.75, at: center }), duration: 1 })
  scene.wait(0.4)
  return scene
}

async function timeline(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 95 })
  const title = new Text('One timeline, independent channels', { fontSize: 32, opacity: 0, transform: T(0, 3.25) })
  const outlined = (color) => ({ fill: alpha(color, 80), stroke: color, strokeWidth: 0.045 })
  const left = new Circle(0.72, outlined(BLUE))
  const middle = new Square(1.35, outlined(PINK))
  const source = new Circle(0.75, outlined(GREEN))
  const target = new Square(1.45, outlined(BLUE))
  new Row({ gap: 0.85, at: [0, 0] }).place(left, middle, source, target)
  const origin = left.center
  scene.add(title, left, middle, source, target)
  scene.fadeIn(title, { duration: 0.7 })
  const middleCenter = scene.authoredCenter(middle)
  scene.parallel((api) => {
    api.transformFunction(left, (a) => T(origin.x, origin.y + 0.55 * globalThis.Math.sin(4 * PI * a), TAU * a), { duration: 3, easing: Easing.LINEAR })
    api.affine(middle, { position: [middleCenter.x, middleCenter.y], rotation: PI, scale: 1.35, duration: 1.1, at: 0.35 })
    api.style(middle, { to: { fill: alpha(GREEN, 80), stroke: GREEN, width: 0.045, worldStroke: true }, duration: 1, at: 1.45 })
    api.interpolate(source, target, { duration: 2.2, at: 0.5 })
  })
  scene.wait(0.35)
  scene.parallel(0.7, (api) => {
    api.fadeOut(left); api.fadeOut(middle, { at: 0.1 }); api.fadeOut(title, { at: 0.2 }); api.fadeOut(source, { at: 0.2 }); api.fadeOut(target, { at: 0.2 })
  })
  return scene
}

function axis(color, end) { return new Line([0, 0], end, { stroke: color, strokeWidth: 0.035 }) }
function panel(centerX) {
  const body = new Square(0.72, { fill: alpha(BLUE, 190), stroke: WHITE })
  const tool = new Group([body, axis(RED, [0.78, 0]), axis(GREEN, [0, 0.78])], { transform: T(-0.55, -0.1, -33 * PI / 180) })
  const p = new Group([axis(RED, [1.5, 0]), axis(GREEN, [0, 1.15]), new Circle(0.07, { fill: WHITE, stroke: null }), tool], { transform: T(centerX, -0.45, 20 * PI / 180) })
  return [p, tool]
}

async function transforms(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 90 })
  header(scene, 'One vector, three coordinate frames', 'move(by=(1.5, 0), frame=...) changes which basis interprets the vector', { y: 3.25 })
  const [lp, lt] = panel(-4.1), [pp, pt] = panel(0), [wp, wt] = panel(4.1)
  const labels = [['LOCAL', -4.1], ['PARENT', 0], ['WORLD', 4.1]].map(([s, x]) => new Text(s, { fontSize: 24, color: YELLOW, transform: T(x, 2.05) }))
  scene.add(lp, pp, wp, ...labels); scene.wait(0.6)
  scene.parallel(2.2, (api) => {
    api.move(lt, [1.5, 0], { frame: LOCAL })
    api.move(pt, [1.5, 0], { frame: PARENT })
    api.move(wt, [1.5, 0], { frame: WORLD })
  })
  scene.wait(0.45)
  scene.camera.affine({ position: [0.65, -0.15], scale: 1.12, duration: 1 })
  scene.camera.affine({ position: [0, 0], scale: 1, duration: 0.9 })
  scene.wait(0.35)
  return scene
}

async function batches(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 90 })
  const title = new Text('600 primitives, two batch objects', { fontSize: 31, opacity: 0, transform: T(0, 3.25) })
  const lines = new LineSet(radialLines(180, 0), { worldStroke: true, zIndex: 0 })
  const dots = new CircleSet(circleItems(420, 0), { zIndex: 2 })
  scene.add(lines, dots, title); scene.fadeIn(title, { duration: 0.6 })
  scene.parallel(2, (api) => { api.batch(dots, { to: circleItems(420, 0.33) }); api.batch(lines, { to: radialLines(180, 0.55) }) })
  scene.parallel(2, (api) => { api.batch(dots, { to: circleItems(420, 0.68) }); api.batch(lines, { to: radialLines(180, 1) }) })
  scene.wait(0.4)
  return scene
}

async function kinematics(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 92 })
  header(scene, 'Open-chain FK = ordinary frame composition', 'T₀ₑ = T₀₁(q₁) · T₁₂(q₂) · T₂₃(q₃)', { y: 3.3 })
  const l1 = 2.2, l2 = 1.7, l3 = 1.15
  const link = (len, color) => new Line([0, 0], [len, 0], { stroke: color, strokeWidth: 0.07 })
  const joint3 = new Group([new Circle(0.11, { fill: ORANGE, stroke: null }), link(l3, ORANGE), new Circle(0.13, { fill: '#ffe069', stroke: null, transform: T(l3, 0), zIndex: 5 })], { transform: T(l2, 0) })
  const joint2 = new Group([new Circle(0.11, { fill: WHITE, stroke: null }), link(l2, GREEN), joint3], { transform: T(l1, 0) })
  const joint1 = new Group([new Circle(0.11, { fill: WHITE, stroke: null }), link(l1, BLUE), joint2])
  moveTo(joint1, [-0.6, -0.55])
  scene.add(joint1); scene.wait(0.6)
  const h1 = scene.authoredState(joint1).transform, h2 = scene.authoredState(joint2).transform, h3 = scene.authoredState(joint3).transform
  scene.parallel(6, (api) => {
    api.transformFunction(joint1, (a) => h1.mul(Transform2D.rotation(0.75 * globalThis.Math.sin(TAU * a))))
    api.transformFunction(joint2, (a) => h2.mul(Transform2D.rotation(-0.9 * globalThis.Math.sin(TAU * a + 0.8))))
    api.transformFunction(joint3, (a) => h3.mul(Transform2D.translation(0.65 * (0.5 - 0.5 * globalThis.Math.cos(TAU * a)), 0)))
  })
  scene.wait(0.5)
  return scene
}

async function infiniteSpace(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 100 })
  header(scene, 'Linear algebra on an infinite plane', 'the infinite grid and finite reference shape receive the same 2×2 matrix', { y: 3.18 })
  const grid = new InfiniteGrid({ step: 0.5, stroke: 'rgba(94,108,136,.45)', strokeWidth: 0.014, zIndex: -4 })
  const x = new InfiniteLine([0, 0], [1, 0], { stroke: alpha(RED, 220), strokeWidth: 0.035, zIndex: -2 })
  const y = new InfiniteLine([0, 0], [0, 1], { stroke: alpha(GREEN, 220), strokeWidth: 0.035, zIndex: -2 })
  const ref = new Polygon([[0.45,0.35],[2.05,0.35],[2.05,0.85],[1.2,0.85],[1.2,1.75],[0.45,1.75]], { fill: alpha(BLUE,145), stroke: CYAN, strokeWidth: 0.045, zIndex: 4 })
  scene.add(grid, x, y, ref, new Circle(0.055, { fill: YELLOW, stroke: null, zIndex: 8 }), new Text('same A', { fontSize: 17, color: CYAN, transform: T(1.28, 2.02) }))
  scene.wait(0.55)
  const objs = [grid, x, y, ref]
  const stage = (name, matrix, provider, duration = 1.65, hold = 0.42) => {
    const label = new Text(name, { fontSize: 24, opacity: 0, transform: T(0, -2.72), zIndex: 20 })
    const formula = new Text(matrix, { fontSize: 18, color: MUTED, opacity: 0, transform: T(0, -3.05), zIndex: 20 })
    scene.add(label, formula)
    scene.parallel(0.28, (api) => { api.fadeIn(label); api.fadeIn(formula) })
    scene.parallel(duration, (api) => objs.forEach((o) => api.transformFunction(o, provider)))
    scene.wait(hold)
    scene.parallel(0.95, (api) => objs.forEach((o) => api.transformFunction(o, (a) => provider(1 - a))))
    scene.parallel(0.24, (api) => { api.fadeOut(label); api.fadeOut(formula) })
    scene.remove(label, formula); scene.wait(0.08)
  }
  stage('Rotation', 'R(θ), θ: 0 → 55° · det A = 1', (a) => Transform2D.rotation(a * 55 * PI / 180))
  stage('Anisotropic scaling', 'A = diag(1.8, 0.55)', (a) => Transform2D.scaling(1 + 0.8 * a, 1 - 0.45 * a))
  stage('Shear', 'A = [[1, 1.15], [0, 1]] · area preserved', (a) => Transform2D.shear(1.15 * a, 0))
  stage('Singular projection', 'A → [[1, 0.65], [0, 0]] · rank 2 → rank 1', (a) => new Transform2D(1, 0.65 * a, 0, 1 - a), 1.9, 0.62)
  stage('General invertible map', 'A = [[1.15, 0.75], [-0.45, 1.05]]', (a) => new Transform2D(1 + 0.15*a, 0.75*a, -0.45*a, 1 + 0.05*a), 1.9)
  scene.wait(0.45)
  return scene
}

async function media(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 110, fps: 30 })
  const image = new Image(asset('image.png'), { width: 3.4, zIndex: 1 })
  const gif = new GIF(asset('anim.gif'), { width: 3, zIndex: 1 })
  const video = new Video(asset('clip.mp4'), { width: 3.8, zIndex: 1 })
  const videoAudio = new Audio(asset('clip.mp4'), { gain: 0.55 })
  const tone = new Audio(asset('tone.wav'), { gain: 0.18 })
  await Promise.all([image.ready, gif.ready, video.ready, videoAudio.ready, tone.ready])
  new Row({ gap: 0.55, at: [0, 0.35] }).place(image, gif, video)
  const labels = [new Text('IMAGE', { fontSize: 24 }), new Text('GIF', { fontSize: 24 }), new Text('VIDEO + AUDIO', { fontSize: 24 })]
  for (let i = 0; i < 3; i++) moveTo(labels[i], [i === 0 ? -3.45 : i === 1 ? 0 : 3.55, -1.65])
  scene.add(image, gif, video, videoAudio, tone, ...labels)
  const gifCenter = scene.authoredCenter(gif)
  scene.parallel(5, (api) => {
    api.media(image, { duration: 5 })
    api.media(gif, { duration: 5, loop: true })
    api.media(video, { duration: 4, sourceStart: 0.25, speed: 1.25, loop: true, at: 0.5 })
    api.media(videoAudio, { duration: 4, sourceStart: 0.25, speed: 1.25, loop: true, at: 0.5 })
    api.media(tone, { duration: 5, loop: true })
    api.affine(image, { rotation: 0.30, scale: 1.08 })
    api.affine(gif, { position: [gifCenter.x, gifCenter.y + 0.25], rotation: -0.16 })
    api.affine(video, { rotation: 0.18 })
  })
  return scene
}


async function sampleClosedSvgContour(url, count = 768) {
  const source = await fetch(url).then((response) => {
    if (!response.ok) throw new Error(`SVG fetch failed (${response.status})`)
    return response.text()
  })
  const xml = new DOMParser().parseFromString(source, 'image/svg+xml')
  const root = xml.documentElement
  const viewBox = (root.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number)
  if (viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
    throw new Error('Fourier SVG requires a valid viewBox')
  }
  const [x0, y0, width, height] = viewBox

  // Browser SVG geometry gives us exact path traversal from the actual asset.
  // Attach an invisible copy because getTotalLength/getPointAtLength are most
  // consistently implemented for nodes participating in an SVG document tree.
  const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  host.setAttribute('viewBox', `${x0} ${y0} ${width} ${height}`)
  host.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;opacity:0;pointer-events:none'
  for (const path of xml.querySelectorAll('path')) host.append(path.cloneNode(true))
  document.body.append(host)
  try {
    const candidates = [...host.querySelectorAll('path')]
      .filter((path) => /[zZ]\s*$/.test(path.getAttribute('d') ?? ''))
      .map((path) => ({ path, length: path.getTotalLength() }))
      .filter(({ length }) => Number.isFinite(length) && length > 0)
    if (!candidates.length) throw new Error('Fourier SVG contains no closed path')
    candidates.sort((a, b) => b.length - a.length)
    const { path, length } = candidates[0]

    // Match Python load_svg(): center the viewBox, flip SVG y-down into
    // Zanim y-up, and use the default 1/72 logical-unit scale.
    const unitScale = 1 / 72
    return Array.from({ length: count }, (_, index) => {
      const point = path.getPointAtLength(length * index / count)
      return [
        (point.x - (x0 + width / 2)) * unitScale,
        -(point.y - (y0 + height / 2)) * unitScale,
      ]
    })
  } finally {
    host.remove()
  }
}

function fourierDft(samples) {
  const n = samples.length
  const half = globalThis.Math.floor(n / 2)
  const terms = []
  for (let k = 0; k < n; k++) {
    let re = 0, im = 0
    for (let index = 0; index < n; index++) {
      const [x, y] = samples[index]
      const angle = -TAU * k * index / n
      const c = globalThis.Math.cos(angle), s = globalThis.Math.sin(angle)
      re += x * c - y * s
      im += x * s + y * c
    }
    terms.push({ frequency: k <= half ? k : k - n, re: re / n, im: im / n })
  }
  return terms
}

function dominantFourierTerms(terms, count = 36) {
  const dc = terms.find((term) => term.frequency === 0) ?? null
  const nonDc = terms
    .filter((term) => term.frequency !== 0)
    .sort((a, b) => {
      const ra = globalThis.Math.hypot(a.re, a.im), rb = globalThis.Math.hypot(b.re, b.im)
      if (globalThis.Math.abs(rb - ra) > 1e-15) return rb - ra
      const abs = globalThis.Math.abs(a.frequency) - globalThis.Math.abs(b.frequency)
      return abs || a.frequency - b.frequency
    })
  const selected = nonDc.slice(0, count - (dc ? 1 : 0))
  selected.sort((a, b) => {
    const abs = globalThis.Math.abs(a.frequency) - globalThis.Math.abs(b.frequency)
    if (abs) return abs
    const ap = a.frequency > 0 ? 0 : 1, bp = b.frequency > 0 ? 0 : 1
    return ap - bp
  })
  return dc ? [dc, ...selected] : selected.slice(0, count)
}

async function fourierDraw(canvas) {
  const scene = await makeScene(canvas, { width: 1920, height: 1080, unitSize: 104 })
  const samples = await sampleClosedSvgContour(asset('fourier_heart.svg'), 768)
  const terms = dominantFourierTerms(fourierDft(samples), 36)

  const reference = new Polyline([...samples, samples[0]], {
    stroke: 'rgba(118,129,151,.31)',
    strokeWidth: 0.018,
    zIndex: -5,
  })
  const epicycles = new FourierEpicycles(terms, {
    startTime: 0.55,
    drawDuration: 6.2,
    circleSamples: 28,
    traceSamples: 1000,
  })
  const formula = new ZMath('f(t) = sum_k c_k e^(2 pi i k t)', {
    fontSize: 29,
    color: '#dfe4f0',
    transform: T(0, 4.25),
    zIndex: 10,
  })
  const termLabel = new ZMath('N = 36', {
    fontSize: 21,
    color: '#96a3bc',
    transform: T(0, 3.72),
    zIndex: 10,
  })
  await Promise.all([formula.ready, termLabel.ready])

  scene.add(reference, epicycles, formula, termLabel)
  scene.wait(0.55 + 6.2 + 0.45)
  return scene
}

async function vectors(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 720, unitSize: 90 })
  header(scene, 'SVG becomes ordinary Zanim vector data', 'one immutable VectorDocument, two independent scene objects', { y: 3.2 })
  const doc = webVectorDocument(await fetch(asset('fourier-heart-vector.json')).then((r) => r.json()))
  const left = new VectorObject2D(doc, { reveal: 0, transform: T(-2.6, -0.45, 0, 0.72) })
  const right = new VectorObject2D(doc, { reveal: 0, opacity: 0.72, transform: T(2.6, -0.45, -0.22, 0.72) })
  scene.add(left, right); scene.wait(0.45)
  scene.parallel((api) => { api.create(left, { duration: 1.8 }); api.create(right, { duration: 1.8, at: 0.35 }) })
  scene.parallel(1.25, (api) => {
    api.affine(left, { position: [-2.25, -0.2], rotation: 0.18, scale: 0.82 })
    api.affine(right, { position: [2.25, -0.2], rotation: -0.38, scale: 0.82 })
    api.animate(right, { opacity: 1 })
  })
  scene.wait(0.65)
  return scene
}

function hilbertGridPoint(order, index) {
  const side = 1 << order
  let x = 0, y = 0, d = index, scale = 1
  while (scale < side) {
    const rx = 1 & globalThis.Math.floor(d / 2), ry = 1 & (d ^ rx)
    if (ry === 0) {
      if (rx === 1) { x = scale - 1 - x; y = scale - 1 - y }
      ;[x, y] = [y, x]
    }
    x += scale * rx; y += scale * ry; d = globalThis.Math.floor(d / 4); scale *= 2
  }
  return [x, y]
}
function hilbertPoints(order, side = 7) {
  const n = 1 << order, half = side / 2, den = n - 1
  return Array.from({ length: n * n }, (_, i) => {
    const [x, y] = hilbertGridPoint(order, i)
    return [side * x / den - half, side * y / den - half]
  })
}

async function hilbert(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 960, unitSize: 100 })
  const colors = [BLUE, CYAN, GREEN, YELLOW, ORANGE, PINK]
  const title = new Text('Hilbert curve', { fontSize: 36, opacity: 0, transform: T(0, 4.25), zIndex: 10 })
  let label = new Text('order 1 · 4 vertices', { fontSize: 21, color: MUTED, opacity: 0, transform: T(0, -4.25), zIndex: 10 })
  let curve = new Polyline(hilbertPoints(1), { stroke: colors[0], strokeWidth: 0.052, trim: 0 })
  scene.add(curve, title, label)
  scene.parallel((api) => { api.create(curve, { duration: 1 }); api.fadeIn(title, { duration: 0.55 }); api.fadeIn(label, { duration: 0.55 }) })
  scene.wait(0.42)
  for (let order = 2; order <= 6; order++) {
    const next = new Polyline(hilbertPoints(order), { stroke: colors[order - 1], strokeWidth: globalThis.Math.max(0.018, 0.052 - 0.006 * (order - 1)) })
    curve = scene.replace(curve, next, { duration: 1.15 })
    const nextLabel = new Text(`order ${order} · ${4 ** order} vertices`, { fontSize: 21, color: MUTED, opacity: 0, transform: T(0, -4.25), zIndex: 10 })
    scene.add(nextLabel)
    scene.parallel(0.18, (api) => { api.fadeOut(label); api.fadeIn(nextLabel) })
    scene.remove(label); label = nextLabel; scene.wait(0.42)
  }
  scene.wait(0.5)
  return scene
}

function fitPoints(points, side = 7) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1])
  const x0 = globalThis.Math.min(...xs), x1 = globalThis.Math.max(...xs), y0 = globalThis.Math.min(...ys), y1 = globalThis.Math.max(...ys)
  const scale = side / globalThis.Math.max(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  return points.map(([x, y]) => [(x - cx) * scale, (y - cy) * scale])
}
function orientChord(points) {
  const a = points[0], b = points.at(-1), rot = -globalThis.Math.atan2(b[1] - a[1], b[0] - a[0]), c = globalThis.Math.cos(rot), s = globalThis.Math.sin(rot)
  return points.map(([x, y]) => [c*x - s*y, s*x + c*y])
}
function koch(order) {
  const h = globalThis.Math.sqrt(3)/2
  let pts = [[-0.5,-h/3],[0.5,-h/3],[0,2*h/3],[-0.5,-h/3]]
  for (let k=0;k<order;k++) {
    const out=[]
    for(let i=0;i<pts.length-1;i++) { const a=pts[i],b=pts[i+1],dx=(b[0]-a[0])/3,dy=(b[1]-a[1])/3,p1=[a[0]+dx,a[1]+dy], p3=[a[0]+2*dx,a[1]+2*dy]; const c=globalThis.Math.cos(-PI/3),s=globalThis.Math.sin(-PI/3),p2=[p1[0]+dx*c-dy*s,p1[1]+dx*s+dy*c]; out.push(a,p1,p2,p3) } out.push(pts.at(-1)); pts=out
  }
  return fitPoints(pts)
}
function arrowhead(order) {
  let word='A'
  for(let k=0;k<order;k++) word=[...word].map((ch)=>ch==='A'?'B-A-B':ch==='B'?'A+B+A':ch).join('')
  let ang=0,x=0,y=0; const pts=[[0,0]]
  for(const ch of word){ if(ch==='A'||ch==='B'){x+=globalThis.Math.cos(ang);y+=globalThis.Math.sin(ang);pts.push([x,y])} else if(ch==='+')ang+=PI/3;else if(ch==='-')ang-=PI/3 }
  return fitPoints(orientChord(pts))
}
function dragon(order) {
  let z=[{x:0,y:0},{x:1,y:0}]
  for(let k=0;k<order;k++){const p=z.at(-1), ext=z.slice(0,-1).reverse().map((q)=>({x:p.x-(q.y-p.y),y:p.y+(q.x-p.x)}));z=z.concat(ext)}
  return fitPoints(orientChord(z.map((p)=>[p.x,p.y])))
}
function levy(order) {
  let pts=[[-0.5,0],[0.5,0]]
  for(let k=0;k<order;k++){const out=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1];out.push(a,[(a[0]+b[0])/2-dy/2,(a[1]+b[1])/2+dx/2])}out.push(pts.at(-1));pts=out}
  return fitPoints(pts)
}

async function fractals(canvas) {
  const scene = await makeScene(canvas, { width: 1280, height: 960, unitSize: 100 })
  const specs = [
    ['Koch snowflake','each edge becomes four self-similar edges',koch,0,5,CYAN],
    ['Sierpiński arrowhead','one continuous curve approaches the Sierpiński triangle',arrowhead,1,7,GREEN],
    ['Heighway dragon','fold, rotate 90°, and repeat',dragon,1,12,PINK],
    ['Lévy C curve','every segment becomes two 45° branches',levy,0,11,ORANGE],
  ]
  for(const [name,sub,gen,first,last,color] of specs){
    let title=new Text(name,{fontSize:35,opacity:0,transform:T(0,4.25),zIndex:10}), subtitle=new Text(sub,{fontSize:19,color:MUTED,opacity:0,transform:T(0,3.78),zIndex:10})
    let label=new Text(`order ${first} · ${gen(first).length-1} segments`,{fontSize:20,color:YELLOW,opacity:0,transform:T(0,-4.28),zIndex:10})
    let curve=new Polyline(gen(first),{stroke:color,strokeWidth:0.052,trim:0,zIndex:1})
    scene.add(curve,title,subtitle,label)
    scene.parallel((api)=>{api.create(curve,{duration:.65});api.fadeIn(title,{duration:.42});api.fadeIn(subtitle,{duration:.48,at:.08});api.fadeIn(label,{duration:.42,at:.08})})
    scene.wait(.38)
    for(let o=first+1;o<=last;o++){curve=scene.replace(curve,new Polyline(gen(o),{stroke:color,strokeWidth:globalThis.Math.max(.018,.052-.003*globalThis.Math.max(0,o-first))}),{duration:.78});const nl=new Text(`order ${o} · ${gen(o).length-1} segments`,{fontSize:20,color:YELLOW,opacity:0,transform:T(0,-4.28),zIndex:10});scene.add(nl);scene.parallel(.16,(api)=>{api.fadeOut(label);api.fadeIn(nl)});scene.remove(label);label=nl;scene.wait(.16)}
    scene.wait(.38);scene.parallel(.32,(api)=>{api.fadeOut(curve);api.fadeOut(title);api.fadeOut(subtitle);api.fadeOut(label)});scene.remove(curve,title,subtitle,label)
  }
  scene.wait(.35)
  return scene
}

function circlePoint(index, count, radius=3.35){const a=TAU*index/count;return [radius*globalThis.Math.cos(a),radius*globalThis.Math.sin(a)]}
function modularItems(count,k){const out=[];for(let i=0;i<count;i++){const u=i/count,a=circlePoint(i,count),b=circlePoint(k*i,count),r=globalThis.Math.round(105+70*(.5+.5*globalThis.Math.sin(TAU*u))),g=globalThis.Math.round(150+70*(.5+.5*globalThis.Math.sin(TAU*u+2.094))),bb=globalThis.Math.round(205+45*(.5+.5*globalThis.Math.sin(TAU*u+4.189)));out.push([a[0],a[1],b[0],b[1],`rgba(${r},${g},${globalThis.Math.min(255,bb)},.57)`,.012])}return out}

async function modularMultiplication(canvas){
  const scene=await makeScene(canvas,{width:1280,height:960,unitSize:100});const n=240,k=new ScalarValue(0);scene.addValue(k)
  const outline=new LineSet(Array.from({length:256},(_,i)=>{const a=circlePoint(i,256),b=circlePoint((i+1)%256,256);return[a[0],a[1],b[0],b[1],'rgba(135,148,174,.43)',.014]}),{opacity:0,worldStroke:true})
  const dots=new CircleSet(Array.from({length:n},(_,i)=>{const p=circlePoint(i,n);return[p[0],p[1],.018,'rgba(190,205,230,.69)']}),{opacity:0,zIndex:2})
  const lines=new DynamicLineSet((time)=>modularItems(n,scene.valueAt(k,time)),{opacity:0,zIndex:1,worldStroke:true})
  const title=new Text('Modular multiplication circle',{fontSize:36,opacity:0,transform:T(0,4.25),zIndex:10}),sub=new Text('connect i → k·i mod n · the multiplier changes continuously',{fontSize:19,color:MUTED,opacity:0,transform:T(0,3.8),zIndex:10}),kv=new DynamicNumber(k,{digits:2,prefix:'k = ',fontSize:28,color:CYAN,opacity:0,transform:T(0,-4.18),zIndex:10}),nl=new Text(`n = ${n}`,{fontSize:18,color:MUTED,opacity:0,transform:T(4.6,-4.18),zIndex:10})
  scene.add(outline,lines,dots,title,sub,kv,nl);scene.parallel(.75,(api)=>[outline,lines,dots,title,sub,kv,nl].forEach((o)=>api.fadeIn(o)));scene.wait(.35);scene.animateValue(k,{to:12,duration:18,easing:Easing.LINEAR});scene.wait(.65);return scene
}

const CONTROL=[[-4.4,-2.2],[-2.2,3],[2,-3],[4.4,2]]
const lerpP=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]
function casteljau(t){const f=[lerpP(CONTROL[0],CONTROL[1],t),lerpP(CONTROL[1],CONTROL[2],t),lerpP(CONTROL[2],CONTROL[3],t)],s=[lerpP(f[0],f[1],t),lerpP(f[1],f[2],t)],q=lerpP(s[0],s[1],t);return[f,s,q]}
function bezier(t){const u=1-t,w=[u**3,3*u*u*t,3*u*t*t,t**3];return[w.reduce((s,k,i)=>s+k*CONTROL[i][0],0),w.reduce((s,k,i)=>s+k*CONTROL[i][1],0)]}
function constructionLines(t){const[f,s]=casteljau(t);return[[f[0][0],f[0][1],f[1][0],f[1][1],CYAN,.026],[f[1][0],f[1][1],f[2][0],f[2][1],CYAN,.026],[s[0][0],s[0][1],s[1][0],s[1][1],ORANGE,.032]]}
function constructionDots(t){const[f,s,q]=casteljau(t);return [...f.map(p=>[p[0],p[1],.078,CYAN,WHITE,.012]),...s.map(p=>[p[0],p[1],.085,ORANGE,WHITE,.012]),[q[0],q[1],.115,YELLOW,WHITE,.012]]}
function traceLines(t){const pts=Array.from({length:221},(_,i)=>bezier(t*i/220));return pts.slice(0,-1).map((p,i)=>[p[0],p[1],pts[i+1][0],pts[i+1][1],GREEN,.045])}

async function deCasteljau(canvas){
  const scene=await makeScene(canvas,{width:1280,height:960,unitSize:100}),v=new ScalarValue(0);scene.addValue(v)
  const control=new LineSet(CONTROL.slice(0,-1).map((p,i)=>[p[0],p[1],CONTROL[i+1][0],CONTROL[i+1][1],'rgba(118,130,154,.45)',.018]),{opacity:0,worldStroke:true}),cdots=new CircleSet(CONTROL.map(p=>[p[0],p[1],.095,'rgba(154,166,191,.69)',WHITE,.014]),{opacity:0,zIndex:4}),trace=new DynamicLineSet(t=>traceLines(scene.valueAt(v,t)),{opacity:0,zIndex:1,worldStroke:true}),construct=new DynamicLineSet(t=>constructionLines(scene.valueAt(v,t)),{opacity:0,zIndex:2,worldStroke:true}),moving=new DynamicCircleSet(t=>constructionDots(scene.valueAt(v,t)),{opacity:0,zIndex:5})
  const labels=[new Text('Bézier curve · De Casteljau',{fontSize:36,opacity:0,transform:T(0,4.25),zIndex:10}),new Text('repeat linear interpolation: 4 points → 3 → 2 → 1',{fontSize:19,color:MUTED,opacity:0,transform:T(0,3.8),zIndex:10}),new Text('level 1',{fontSize:17,color:CYAN,opacity:0,transform:T(-4.75,3.35),zIndex:10}),new Text('level 2',{fontSize:17,color:ORANGE,opacity:0,transform:T(-4.75,2.98),zIndex:10}),new Text('B(t)',{fontSize:18,color:GREEN,opacity:0,transform:T(-4.75,2.61),zIndex:10}),new DynamicNumber(v,{digits:2,prefix:'t = ',fontSize:27,color:YELLOW,opacity:0,transform:T(0,-4.2),zIndex:10})]
  scene.add(control,trace,construct,cdots,moving,...labels);scene.parallel(.75,(api)=>[control,trace,construct,cdots,moving,...labels].forEach(o=>api.fadeIn(o)));scene.wait(.35);scene.animateValue(v,{to:1,duration:7,easing:Easing.LINEAR});scene.wait(.75);return scene
}

async function mandelbrotJulia(canvas){
  const scene=await makeScene(canvas,{width:1280,height:720,unitSize:160});const centered=(re,im,s)=>Transform2D.translation(-s*re,-s*im).mul(Transform2D.scaling(s))
  const title=new Text('Infinite fractals',{fontSize:35,opacity:0,transform:T(0,1.94),zIndex:20}),sub=new Text('viewport-resolved in Zig/WASM · every zoom recomputes the complex plane',{fontSize:18,color:MUTED,opacity:0,transform:T(0,1.62),zIndex:20}),ml=new Text('Mandelbrot · z ← z² + c',{fontSize:22,opacity:0,transform:T(-2.7,-1.88),zIndex:20}),jl=new Text('Julia · c = -0.8 + 0.156i',{fontSize:22,opacity:0,transform:T(-2.82,-1.88),zIndex:20})
  const m=new MandelbrotSet({maxIter:360,insideColor:'#04060d',paletteColor:'#69b9ff',colorShift:.06,colorScale:1,transform:centered(-.55,0,1.18),zIndex:-10,viewport:'transform'}),j=new JuliaSet([-.8,.156],{maxIter:320,insideColor:'#05050d',paletteColor:'#ff9b69',colorShift:.4,colorScale:1.08,opacity:0,transform:centered(0,0,1.28),zIndex:-9,viewport:'transform'})
  scene.add(m,j,title,sub,ml,jl);scene.parallel(.65,(api)=>{api.fadeIn(title);api.fadeIn(sub);api.fadeIn(ml)});scene.wait(.3);const mc=[-.743643887037151,.13182590420533];scene.affine(m,{position:[-180*mc[0],-180*mc[1]],scale:180,duration:4.2});scene.wait(.55);scene.parallel(.7,(api)=>{api.fadeOut(m);api.fadeOut(ml);api.fadeIn(j);api.fadeIn(jl)});scene.wait(.25);const jc=[-.5966666666666667,-.15];scene.affine(j,{position:[-30*jc[0],-30*jc[1]],scale:30,duration:4});scene.wait(.65);scene.parallel(.45,(api)=>{api.fadeOut(j);api.fadeOut(jl);api.fadeOut(title);api.fadeOut(sub)});return scene
}

async function complexMapping(canvas){
  const scene=await makeScene(canvas,{width:1280,height:960,unitSize:100});const title=new Text('Infinite complex-plane mappings',{fontSize:36,opacity:0,transform:T(0,4.25),zIndex:10}),sub=new Text('native inverse mapping · no source window · no sampled polylines',{fontSize:19,color:MUTED,opacity:0,transform:T(0,3.82),zIndex:10});scene.add(title,sub,new Text('Re(z) = constant',{fontSize:17,color:ORANGE,transform:T(-4.75,3.33)}),new Text('Im(z) = constant',{fontSize:17,color:CYAN,transform:T(-4.75,3.01)}));scene.parallel(.7,(api)=>{api.fadeIn(title);api.fadeIn(sub)});scene.wait(.25)
  const maps=[['square','H_a(z)=(1-a)z+a z²',.5,null],['reciprocal','H_a(z): z → 1/z',.5,null],['exp','F_a(z)=e^z-1+(1-a)e^(-z)',[.5,2*PI/12],null],['mobius','M_a(z): z → (A_a z+B_a)/(C_a z+D_a)',.5,[1.112,-.188,.70,-.32,.24,-.16,1,0]]]
  for(const [kind,label,step,mapParams] of maps){const p=new ScalarValue(0);scene.addValue(p);const g=new ComplexMappedGrid(kind,{step,progress:p,strokePx:1.98,opacity:0,zIndex:1,...(mapParams?{mapParams}:{})}),l=new Text(label,{fontSize:25,color:YELLOW,opacity:0,transform:T(0,-4.12),zIndex:10});scene.add(g,l);scene.parallel(.42,(api)=>{api.fadeIn(g);api.fadeIn(l)});scene.animateValue(p,{to:1,duration:2.6,easing:smooth});scene.wait(.65);scene.parallel(.34,(api)=>{api.fadeOut(g);api.fadeOut(l)});scene.remove(g,l);scene.wait(.12)}scene.wait(.35);return scene
}

async function mathShowcase(canvas) {
  const scene = await makeScene(canvas, { width: 1920, height: 1080, unitSize: 105 })
  const matrixTicks = await fetch(asset('math-matrices.json')).then((r) => r.json())
  const formulaSource = 'f(x) = 1.2 + 0.5 sin(1.2 x) + 0.055 x^2'
  const integralSource = 'integral_a^b f(x) dif x'
  const formula = new ZMath(formulaSource, { fontSize: 30, color: '#f0f2f8', transform: T(3.7, 2.35) })
  const integral = new ZMath(integralSource, { fontSize: 30, color: '#f0f2f8', transform: T(3.7, 1.45) })
  await Promise.all([formula.ready, integral.ready])

  const title = new Text('Dynamic geometry and dynamic math', { fontSize: 33, opacity: 0, transform: T(0, 4.7) })
  const progress = new ScalarValue(0)
  scene.addValue(progress)

  const f = (x) => 1.2 + 0.5 * globalThis.Math.sin(1.2 * x) + 0.055 * x * x
  const lo = (t) => -2.6 + 0.7 * globalThis.Math.sin(0.9 * t)
  const hi = (t) => 1.5 + 0.8 * globalThis.Math.sin(1.1 * t + 0.8)
  const map = (x, y) => [-4 + (x / 8) * 9, -0.8 + ((y - 1.4) / 3.6) * 5.5]
  const integralValue = (time) => {
    let a = lo(time), b = hi(time), sign = 1
    if (a > b) { [a, b] = [b, a]; sign = -1 }
    let total = 0, lastX = a, lastY = f(a)
    for (let i = 1; i < 120; i++) {
      const x = a + (b - a) * i / 119, y = f(x)
      total += 0.5 * (lastY + y) * (x - lastX)
      lastX = x; lastY = y
    }
    return sign * total
  }

  const gridItems = []
  for (let x = -4; x <= 4; x += 1) if (x !== 0) {
    const a = map(x, -0.4), b = map(x, 3.2)
    gridItems.push([a[0], a[1], b[0], b[1], 'rgba(85,95,116,.255)', 0.01])
  }
  for (let y = 0; y <= 3.0 + 1e-12; y += 0.5) if (globalThis.Math.abs(y) > 1e-12) {
    const a = map(-4, y), b = map(4, y)
    gridItems.push([a[0], a[1], b[0], b[1], 'rgba(85,95,116,.255)', 0.01])
  }
  const grid = new LineSet(gridItems, { worldStroke: true, zIndex: -4 })
  const xAxisA = map(-4, 0), xAxisB = map(4, 0), yAxisA = map(0, -0.4), yAxisB = map(0, 3.2)
  const axes = new LineSet([
    [xAxisA[0], xAxisA[1], xAxisB[0], xAxisB[1], 'rgba(150,160,183,.86)', 0.022],
    [yAxisA[0], yAxisA[1], yAxisB[0], yAxisB[1], 'rgba(150,160,183,.86)', 0.022],
  ], { worldStroke: true, zIndex: -2 })
  const graph = new FunctionPlot(
    X.mul(1.2).sin().mul(0.5).add(X.mul(X).mul(0.055)).add(1.2),
    { xRange: [-4, 4], axesXRange: [-4, 4], axesYRange: [-0.4, 3.2], width: 9, height: 5.5, center: [-4, -0.8], samples: 260, stroke: '#76cdff', strokeWidth: 0.04 },
  )
  const area = new DynamicPolyline((time) => {
    let a = lo(time), b = hi(time)
    if (a > b) [a, b] = [b, a]
    const points = [map(a, 0)]
    for (let i = 0; i < 120; i++) {
      const x = a + (b - a) * i / 119
      points.push(map(x, f(x)))
    }
    points.push(map(b, 0))
    return points
  }, { closed: true, fill: 'rgba(78,139,255,.41)', stroke: '#70aaff', strokeWidth: 0.018, zIndex: -1 })

  const lowerNumber = new DynamicNumber((time) => lo(time), { digits: 1, fontSize: 20, color: '#ffb469', transform: T(2.48, 1.47), zIndex: 8 })
  const upperNumber = new DynamicNumber((time) => hi(time), { digits: 1, fontSize: 20, color: '#52dcb4', transform: T(2.78, 2.18), zIndex: 8 })
  const integralNumber = new DynamicNumber((time) => integralValue(time), { digits: 3, fontSize: 25, color: '#ffdc91', transform: T(5.35, 1.47), zIndex: 8 })

  const matrixItems = (time) => {
    const tick = globalThis.Math.max(0, globalThis.Math.min(matrixTicks.length - 1, globalThis.Math.floor(globalThis.Math.max(0, time - 0.4) * 3)))
    const { a, b, c } = matrixTicks[tick]
    const items = []
    const emitMatrix = (matrix, cx, color, cell = 0.48) => {
      for (let r = 0; r < 2; r++) for (let col = 0; col < 2; col++) {
        items.push([cx + (col - 0.5) * cell, -0.94 - r * 0.50, String(matrix[r][col]), color, 31, 500])
      }
      items.push([cx - 0.64, -1.19, '[', MUTED, 50, 300], [cx + 0.64, -1.19, ']', MUTED, 50, 300])
    }
    emitMatrix(a, 1.95, WHITE)
    items.push([2.93, -1.19, '×', MUTED, 27, 400])
    emitMatrix(b, 3.78, WHITE)
    items.push([4.75, -1.19, '=', MUTED, 27, 400])
    emitMatrix(c, 5.72, '#ffb166', 0.55)
    return items
  }
  const matrices = new DynamicTextSet(matrixItems, { fontFamily: 'ui-monospace, SFMono-Regular, monospace', zIndex: 9 })

  const progressNumber = new DynamicNumber(progress, { digits: 1, suffix: '%', fontSize: 23, color: '#ffdc91', transform: T(5.05, -3.25) })
  const progressLabel = new Text('ScalarValue → DynamicNumber', { fontSize: 18, color: '#96a2bc', transform: T(3.65, -2.95) })

  scene.add(grid, area, axes, graph, formula, integral, lowerNumber, upperNumber, integralNumber, matrices, progressNumber, progressLabel, title)
  scene.parallel(5.3, (api) => {
    api.fadeIn(title, { duration: 0.7 })
    api.animateValue(progress, { to: 100 })
  })
  scene.wait(0.7)
  return scene
}

export const scenes = [
  { id:'basics', title:'Core authoring', source:'showcase/basics.py', width:1280, height:720, builder:basics },
  { id:'state', title:'Scene-owned state', source:'showcase/state_model.py', width:1280, height:720, builder:stateModel },
  { id:'layout', title:'Layout', source:'showcase/layout.py', width:1280, height:720, builder:layout },
  { id:'timeline', title:'Timeline', source:'showcase/timeline.py', width:1280, height:720, builder:timeline },
  { id:'transforms', title:'Coordinate frames', source:'showcase/transforms.py', width:1280, height:720, builder:transforms },
  { id:'batches', title:'Dense batches', source:'showcase/batches.py', width:1280, height:720, builder:batches },
  { id:'kinematics', title:'Forward kinematics', source:'showcase/kinematics.py', width:1280, height:720, builder:kinematics },
  { id:'infinite', title:'Infinite linear algebra', source:'showcase/infinite_space.py', width:1280, height:720, builder:infiniteSpace },
  { id:'interactive-linear', title:'Interactive linear algebra', source:'Web interaction lab', width:1280, height:720, interactive:'linear-algebra', note:'Pointer-driven retained Scene state; no authored timeline.' },
  { id:'math', title:'Math + dynamic geometry', source:'showcase/math.py', width:1920, height:1080, builder:mathShowcase, note:'Math is precompiled to SVG automatically by @zanim/web/vite; the production browser only loads the generated vector asset.' },
  { id:'media', title:'External media', source:'showcase/media.py', width:1280, height:720, builder:media },
  { id:'vectors', title:'Vector document', source:'showcase/vectors.py', width:1280, height:720, builder:vectors },
  { id:'fourier', title:'Fourier drawing', source:'extras/fourier_draw.py', width:1920, height:1080, builder:fourierDraw, note:'The browser fetches assets/fourier_heart.svg, samples the closed path, computes the DFT, and feeds FourierEpicycles directly.' },
  { id:'hilbert', title:'Hilbert curve', source:'extras/hilbert_curve.py', width:1280, height:960, builder:hilbert },
  { id:'fractals', title:'Classic path fractals', source:'extras/fractals.py', width:1280, height:960, builder:fractals },
  { id:'modular', title:'Modular multiplication', source:'extras/modular_multiplication.py', width:1280, height:960, builder:modularMultiplication },
  { id:'bezier', title:'De Casteljau', source:'extras/de_casteljau.py', width:1280, height:960, builder:deCasteljau },
  { id:'mandelbrot', title:'Mandelbrot + Julia', source:'extras/mandelbrot_julia.py', width:1280, height:720, builder:mandelbrotJulia },
  { id:'complex', title:'Complex mapping', source:'extras/complex_mapping.py', width:1280, height:960, builder:complexMapping },
  { id:'neural-forward', title:'Neural forward pass', source:'extras/neural_forward_pass.py', width:1920, height:1080, builder:neuralForwardPass, note:'Faithful 10 s port of the uploaded Manim demo: identical point cloud, weights, sample, nonlinear geometry and signal timing.' },
  ...janimApiScenes,
]

export const deferred = [
  ['Red-black tree', 'discrete insertion/fix-up event trace needs a faithful port rather than a cosmetic imitation'],
  ['Sorting algorithms', 'same reason: event trace and settled/active states should be ported exactly'],
  ['MNIST training / MIDI', 'specialized assets and event/data pipelines deferred'],
]
