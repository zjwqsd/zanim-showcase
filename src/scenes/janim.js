import {
  Box3D,
  Camera3D,
  Circle,
  Column,
  CustomObject2D,
  DynamicCircleSet,
  DynamicNumber,
  DynamicPolyline,
  DynamicRectSet,
  Easing,
  Group,
  Math as ZMath,
  MeshObject3D,
  Polygon,
  Polyline,
  Rectangle,
  Row,
  Scene,
  Scene3DLayer,
  Square,
  TAU,
  Text,
  Transform2D,
  Transform3D,
  TriangleMesh,
  Vec3,
  VectorObject2D,
} from '@zanim/web'

const WHITE = '#ffffff'
const BLUE = '#58c4dd'
const BLUE_E = '#224b87'
const GREEN = '#83c167'
const RED = '#fc6255'
const YELLOW = '#f7d96f'
const GOLD = '#f0ac5f'
const ORANGE = '#ff862f'
const PURPLE = '#9a72ac'
const MAROON = '#c55f73'
const LIGHT_BROWN = '#b78b64'
const PURPLE_E = '#5c3782'
const MUTED = '#919eb8'
const PI = globalThis.Math.PI
const smooth = Easing.SMOOTHSTEP
const clamp01 = (x) => globalThis.Math.max(0, globalThis.Math.min(1, x))
const alpha = (hex, a) => `${hex}${globalThis.Math.round(clamp01(a) * 255).toString(16).padStart(2, '0')}`
const T = (x = 0, y = 0, rotation = 0, scale = 1) => Transform2D.affine({ position: [x, y], rotation, scale })
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

async function makeScene(canvas, { background = '#000000', fps = 60 } = {}) {
  const rect = canvas.getBoundingClientRect()
  const scale = globalThis.Math.max(0.2, rect.width / 1920)
  return Scene.create(canvas, {
    fps,
    renderer: { unitSize: 135 * scale, background },
  })
}

let generatedDataPromise = null
function generatedData() {
  if (!generatedDataPromise) {
    generatedDataPromise = fetch(`${import.meta.env.BASE_URL}generated/gallery-data.json`).then((response) => {
      if (!response.ok) throw new Error(`gallery data: HTTP ${response.status}`)
      return response.json()
    })
  }
  return generatedDataPromise
}

function starPoints(outer = 1, inner = 0.45, count = 5, phase = PI / 2) {
  return Array.from({ length: count * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner
    const a = phase + i * PI / count
    return [r * globalThis.Math.cos(a), r * globalThis.Math.sin(a)]
  })
}

function sectorPoints(start, sweep, radius, center = [0, 0], samples = 30) {
  return [center, ...Array.from({ length: samples + 1 }, (_, i) => {
    const a = start + sweep * i / samples
    return [center[0] + radius * globalThis.Math.cos(a), center[1] + radius * globalThis.Math.sin(a)]
  })]
}

function trianglePoints(center, radius, phase = PI / 2) {
  return Array.from({ length: 3 }, (_, i) => {
    const a = phase + TAU * i / 3
    return [center[0] + radius * globalThis.Math.cos(a), center[1] + radius * globalThis.Math.sin(a)]
  })
}

function applyTransform(transform, point) {
  return transform.apply(point[0], point[1])
}

function mapDocument(document, fn) {
  return {
    width: document.width,
    height: document.height,
    group_count: document.group_count,
    paths: document.paths.map((path) => ({
      ...path,
      contours: path.contours.map((contour) => ({
        ...contour,
        segments: contour.segments.map((segment) => segment.map((point) => fn(point))),
      })),
    })),
  }
}

function recolorDocument(document, color) {
  return {
    ...document,
    paths: document.paths.map((path) => ({
      ...path,
      fill: path.fill == null ? null : color,
      stroke: path.stroke == null ? null : { ...path.stroke, color },
    })),
  }
}

function mergeDocuments(documents) {
  return {
    width: globalThis.Math.max(...documents.map((doc) => doc.width)),
    height: globalThis.Math.max(...documents.map((doc) => doc.height)),
    group_count: 1,
    paths: documents.flatMap((doc) => doc.paths.map((path) => ({ ...path, group: 0 }))),
  }
}

function lerpHex(a, b, t) {
  const parse = (value) => [1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16))
  const x = parse(a), y = parse(b), u = clamp01(t)
  return `rgb(${x.map((v, i) => globalThis.Math.round(v + (y[i] - v) * u)).join(',')})`
}

class DynamicVectorDocument extends VectorObject2D {
  constructor(provider, options = {}) {
    super({ width: 1, height: 1, group_count: 0, paths: [] }, options)
    this.provider = provider
  }
  draw(renderer, parent) {
    this.document = this.provider(renderer.time ?? 0)
    this.invalidate()
    super.draw(renderer, parent)
  }
}

async function helloJAnim(canvas) {
  const scene = await makeScene(canvas)
  const circle = new Circle(1, { stroke: BLUE, strokeWidth: 0.045, trim: 0 })
  scene.add(circle)
  scene.wait(1)
  scene.create(circle, { duration: 1 })
  const square = new Square(2, { fill: alpha(GREEN, 0.5), stroke: GREEN, strokeWidth: 0.045 })
  scene.replace(circle, square, { duration: 1 })
  scene.trim(square, { to: 0, duration: 1 })
  scene.wait(1)
  return scene
}

async function basicAnimation(canvas) {
  const scene = await makeScene(canvas)
  const circle = new Circle(1, { stroke: WHITE, strokeWidth: 0.045, trim: 0 })
  const star = new Polygon(starPoints(), { stroke: WHITE, strokeWidth: 0.045, fill: null, transform: T(0, 0, 0, 0) })
  scene.add(circle, star)
  scene.wait(1)
  scene.create(circle, { duration: 1 })
  scene.affine(circle, { position: [-3, 0], scale: 1.5, duration: 1 })
  scene.style(circle, { to: { fill: alpha(RED, 0.5), stroke: RED, width: 0.045, worldStroke: true }, duration: 1 })
  scene.transformFunction(star, (a) => T(0, 0, TAU * a, a), { duration: 1 })
  scene.affine(star, { position: [3, 0], scale: 1.5, duration: 1 })
  scene.style(star, { to: { fill: alpha(YELLOW, 0.5), stroke: YELLOW, width: 0.045, worldStroke: true }, duration: 1 })
  scene.wait(1)
  return scene
}

function richLine(parts, y) {
  const children = parts.map(([text, color, scale]) => new Text(text, { fontSize: 28 * scale, color, opacity: 0 }))
  new Row({ gap: 0.02, at: [0, y] }).place(...children)
  return children
}

async function textExample(canvas) {
  const scene = await makeScene(canvas)
  const visual = new CustomObject2D(({ renderer, ctx, time }) => {
    const scale = renderer.canvas.width / 1920
    const titleP = smooth(clamp01((time - 1) / 1))
    const [tx, ty] = renderer.toDevice(0, .7)
    ctx.save()
    ctx.font = `500 ${64 * scale}px Inter, ui-sans-serif, system-ui`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = WHITE
    const title = 'Here is some text', w = ctx.measureText(title).width
    ctx.beginPath(); ctx.rect(tx - w / 2, ty - 48 * scale, w * titleP, 96 * scale); ctx.clip()
    ctx.fillText(title, tx, ty)
    ctx.restore()

    const d0 = clamp01((time - 2) / 1) * (1 - clamp01((time - 3) / 1))
    const d1 = clamp01((time - 3) / 1)
    const drawRich = (parts, opacity) => {
      const [cx, cy] = renderer.toDevice(0, -.6)
      const widths = parts.map(([text,,size]) => {
        ctx.font = `500 ${28 * size * scale}px Inter, ui-sans-serif, system-ui`
        return ctx.measureText(text).width
      })
      let x = cx - (widths.reduce((a,b)=>a+b,0) + (parts.length-1)*2*scale) / 2
      ctx.save(); ctx.globalAlpha *= opacity; ctx.textAlign='left'; ctx.textBaseline='middle'
      parts.forEach(([text,color,size],i)=>{
        ctx.font = `500 ${28 * size * scale}px Inter, ui-sans-serif, system-ui`
        ctx.fillStyle=color; ctx.fillText(text,x,cy); x += widths[i] + 2*scale
      })
      ctx.restore()
    }
    drawRich([['You can also apply ',WHITE,1],['styles',BLUE,1],[' to the text.',WHITE,1]],d0)
    drawRich([['You can also apply ',WHITE,1],['styles',GREEN,1.4],[' to the text.',WHITE,1]],d1)
  })
  scene.add(visual); scene.wait(5); return scene
}

async function typstExample(canvas) {
  const scene = await makeScene(canvas)
  const lines = [
    new Text('JAnim provides TypstText and TypstMath classes to insert Typst content.', { fontSize: 27, opacity: 0 }),
    new Text('Math expressions are also supported.', { fontSize: 27, opacity: 0 }),
    new ZMath('A = pi r^2', { fontSize: 34, color: WHITE, reveal: 0 }),
    new ZMath('"area" = pi dot "radius"^2', { fontSize: 34, color: WHITE, reveal: 0 }),
    new ZMath('cal(A) := { x in RR | x "is natural" }', { fontSize: 31, color: WHITE, reveal: 0 }),
    new ZMath('5 < 17', { fontSize: 34, color: WHITE, reveal: 0 }),
    new Text('You can also use TypstDoc, which automatically align to the top of the viewport,', { fontSize: 24, opacity: 0 }),
    new Text('instead of the center.', { fontSize: 24, opacity: 0 }),
  ]
  await Promise.all(lines.filter((item) => item.ready).map((item) => item.ready))
  new Column({ gap: 0.25, at: [0, 0.3] }).place(...lines)
  scene.add(...lines)
  scene.parallel((api) => {
    lines.forEach((item, i) => {
      if (item instanceof VectorObject2D) api.create(item, { duration: 3.5, at: i * 0.12 })
      else api.fadeIn(item, { duration: 3.5, at: i * 0.12 })
    })
  })
  scene.wait(1)
  scene.parallel(1, (api) => lines.forEach((item) => api.fadeOut(item)))

  const cells = [
    new Text('TypstText', { fontSize: 34, color: BLUE, opacity: 0, transform: T(-3, 0.8) }),
    new Text('This is a sentence with a math expression f(x)=x²', { fontSize: 27, opacity: 0, transform: T(3, 0.8) }),
    new Text('TypstMath', { fontSize: 34, color: BLUE, opacity: 0, transform: T(-3, -0.8) }),
    new ZMath('sum_(i=1)^n x_i = x_1 + x_2 + dots.c + x_n', { fontSize: 31, color: WHITE, reveal: 0, transform: T(3, -0.8) }),
  ]
  await Promise.all(cells.filter((item) => item.ready).map((item) => item.ready))
  scene.add(...cells)
  scene.parallel((api) => {
    cells.forEach((item, i) => {
      if (item instanceof VectorObject2D) api.create(item, { duration: 1.5, at: i * 0.1 })
      else api.fadeIn(item, { duration: 1.5, at: i * 0.1 })
    })
  })
  scene.wait(1)
  scene.parallel(1, (api) => cells.forEach((item) => api.fadeOut(item)))
  return scene
}

async function typstColorize(canvas) {
  const scene = await makeScene(canvas)

  const objs = [
    new ZMath('cos', { fontSize: 95, color: WHITE, transform: T(-2.75, 0) }),
    new ZMath('2', { fontSize: 56, color: WHITE, transform: T(-2.02, .34) }),
    new ZMath('theta', { fontSize: 95, color: WHITE, transform: T(-1.58, 0) }),
    new ZMath('+', { fontSize: 95, color: WHITE, transform: T(-.68, 0) }),
    new ZMath('sin', { fontSize: 95, color: WHITE, transform: T(.10, 0) }),
    new ZMath('2', { fontSize: 56, color: WHITE, transform: T(.79, .34) }),
    new ZMath('theta', { fontSize: 95, color: WHITE, transform: T(1.23, 0) }),
    new ZMath('=', { fontSize: 95, color: WHITE, transform: T(2.13, 0) }),
    new ZMath('1', { fontSize: 95, color: WHITE, transform: T(2.86, 0) }),
  ]
  const replacements = {
    cosBlue: new ZMath('cos', { fontSize: 95, color: BLUE, opacity: 0, transform: T(-2.75, 0) }),
    sinBlue: new ZMath('sin', { fontSize: 95, color: BLUE, opacity: 0, transform: T(.10, 0) }),
    thetaGold: new ZMath('theta', { fontSize: 95, color: GOLD, opacity: 0, transform: T(-1.58, 0) }),
    thetaOrange: new ZMath('theta', { fontSize: 95, color: ORANGE, opacity: 0, transform: T(1.23, 0) }),
    thetaGreen0: new ZMath('theta', { fontSize: 95, color: GREEN, opacity: 0, transform: T(-1.58, 0) }),
    thetaGreen1: new ZMath('theta', { fontSize: 95, color: GREEN, opacity: 0, transform: T(1.23, 0) }),
    powRed0: new ZMath('2', { fontSize: 56, color: RED, opacity: 0, transform: T(-2.02, .34) }),
    powRed1: new ZMath('2', { fontSize: 56, color: RED, opacity: 0, transform: T(.79, .34) }),
  }
  await Promise.all([...objs, ...Object.values(replacements)].map((obj) => obj.ready))
  scene.add(...objs)
  scene.wait(1)

  const swap = (index, next) => {
    scene.add(next)
    const old = objs[index]
    scene.parallel(1, (api) => {
      api.fadeOut(old)
      api.fadeIn(next)
    })
    objs[index] = next
  }

  swap(0, replacements.cosBlue)
  swap(4, replacements.sinBlue)
  swap(2, replacements.thetaGold)
  swap(6, replacements.thetaOrange)
  scene.wait(1)

  scene.add(replacements.thetaGreen0, replacements.thetaGreen1)
  scene.parallel(1, (api) => {
    api.fadeOut(objs[2]); api.fadeIn(replacements.thetaGreen0)
    api.fadeOut(objs[6]); api.fadeIn(replacements.thetaGreen1)
  })
  objs[2] = replacements.thetaGreen0
  objs[6] = replacements.thetaGreen1

  scene.add(replacements.powRed0, replacements.powRed1)
  scene.parallel(1, (api) => {
    api.fadeOut(objs[1]); api.fadeIn(replacements.powRed0)
    api.fadeOut(objs[5]); api.fadeIn(replacements.powRed1)
  })
  scene.wait(1)
  return scene
}

async function animatingPi(canvas) {
  const scene = await makeScene(canvas)
  const piGlyph = new ZMath('pi', { fontSize: 24, color: WHITE })
  await piGlyph.ready
  const glyph = piGlyph.document
  const placed = []
  for (let row = 0; row < 10; row++) for (let col = 0; col < 10; col++) {
    const dx = (col - 4.5) * 0.68, dy = (4.5 - row) * 0.62
    placed.push(mapDocument(glyph, ([x, y]) => [x + dx, y + dy]))
  }
  const base = mergeDocuments(placed)
  const shift = Transform2D.translation(-1, 0)
  const fit = Transform2D.scaling(0.66 / 0.68, 0.66 / 0.62)
  const fittedBlue = mapDocument(recolorDocument(base, BLUE), (point) => applyTransform(fit, point))
  const expPoint = ([x, y]) => { const m = globalThis.Math.exp(x); return [m * globalThis.Math.cos(y), m * globalThis.Math.sin(y)] }
  const wavePoint = ([x, y]) => [x + 0.5 * globalThis.Math.sin(y), y + 0.5 * globalThis.Math.sin(x)]
  const expBlue = mapDocument(fittedBlue, expPoint)
  const lerpPoint = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]
  const affineBetween = (a, b, u) => new Transform2D(
    a.xx + (b.xx - a.xx) * u, a.xy + (b.xy - a.xy) * u,
    a.yx + (b.yx - a.yx) * u, a.yy + (b.yy - a.yy) * u,
    a.tx + (b.tx - a.tx) * u, a.ty + (b.ty - a.ty) * u,
  )

  const documentAt = (t) => {
    let colorDoc
    if (t < 1) colorDoc = recolorDocument(base, WHITE)
    else if (t < 2) colorDoc = recolorDocument(base, lerpHex(WHITE, YELLOW, smooth(t - 1)))
    else if (t < 3) return mapDocument(recolorDocument(base, YELLOW), (p) => applyTransform(shift, p))
    else if (t < 4) colorDoc = recolorDocument(base, lerpHex(YELLOW, BLUE, smooth(t - 3)))
    else colorDoc = recolorDocument(base, BLUE)

    if (t < 1) return mapDocument(colorDoc, (p) => applyTransform(Transform2D.translation(-smooth(t), 0), p))
    if (t < 5) return mapDocument(colorDoc, (p) => applyTransform(shift, p))
    if (t < 6) {
      const tr = affineBetween(shift, fit, smooth(t - 5))
      return mapDocument(colorDoc, (p) => applyTransform(tr, p))
    }
    if (t < 7) return fittedBlue
    if (t < 12) {
      const u = smooth((t - 7) / 5)
      return mapDocument(fittedBlue, (p) => lerpPoint(p, expPoint(p), u))
    }
    if (t < 13) return expBlue
    if (t < 18) {
      const u = smooth((t - 13) / 5)
      return mapDocument(expBlue, (p) => lerpPoint(p, wavePoint(p), u))
    }
    return mapDocument(expBlue, wavePoint)
  }

  scene.add(new DynamicVectorDocument(documentAt))
  scene.wait(19)
  return scene
}

async function numberPlane(canvas) {
  const scene = await makeScene(canvas)
  const lines = []

  // JAnim NumberPlane(faded_line_ratio=1): one faded half-step line between
  // adjacent major grid lines, plus the coordinate axes.
  for (let x = -7; x <= 7; x++) {
    if (x !== 0) lines.push(new Polyline([[x, -4], [x, 4]], {
      stroke: '#236b8e', strokeWidth: 2 / 90, trim: 0,
    }))
  }
  for (let x = -6.5; x <= 6.5; x += 1) {
    lines.push(new Polyline([[x, -4], [x, 4]], {
      stroke: 'rgba(35,107,142,.5)', strokeWidth: 1 / 90, trim: 0,
    }))
  }
  for (let y = -4; y <= 4; y++) {
    if (y !== 0) lines.push(new Polyline([[-7, y], [7, y]], {
      stroke: '#236b8e', strokeWidth: 2 / 90, trim: 0,
    }))
  }
  for (let y = -3.5; y <= 3.5; y += 1) {
    lines.push(new Polyline([[-7, y], [7, y]], {
      stroke: 'rgba(35,107,142,.5)', strokeWidth: 1 / 90, trim: 0,
    }))
  }
  lines.push(new Polyline([[-7, 0], [7, 0]], { stroke: WHITE, strokeWidth: 2 / 90, trim: 0 }))
  lines.push(new Polyline([[0, -4], [0, 4]], { stroke: WHITE, strokeWidth: 2 / 90, trim: 0 }))

  const plane = new Group(lines)
  const graphPoints = Array.from({ length: 320 }, (_, i) => {
    const x = -7 + 14 * i / 319
    return [x, globalThis.Math.sin(x)]
  })
  const graph = new Polyline(graphPoints, { stroke: BLUE, strokeWidth: 4 / 90, trim: 0 })

  scene.add(plane, graph)
  scene.wait(.2)
  scene.parallel((api) => {
    const stagger = lines.length > 1 ? (2 - 1.32) / (lines.length - 1) : 0
    lines.forEach((line, i) => api.create(line, { duration: 1.32, at: i * stagger }))
  })
  scene.create(graph, { duration: 1 })
  scene.wait(1)

  const matrix = new Transform2D(3, -1, 1, 2, 0, 0)
  scene.parallel(2, (api) => {
    api.animate(plane, { transform: matrix })
    api.animate(graph, { transform: matrix })
  })
  scene.wait(1)
  return scene
}

function updaterWidth(t) {
  if (t < 1) return 2
  if (t < 2) return 2 * (1 + (t - 1))
  if (t < 3) return 4 * (1 - 0.5 * (t - 2))
  if (t < 4) return 2 + 3 * (t - 3)
  if (t < 9) { const a = (t - 4) / 5; return 5 + 2.5 * globalThis.Math.sin(a * 5) }
  return 5
}

async function updaterExample(canvas) {
  const scene = await makeScene(canvas)
  const square = new DynamicRectSet((time) => [[0, 0, globalThis.Math.max(0.05, updaterWidth(time)), 2, BLUE_E, null, 0]], { zIndex: 0 })
  const brace = new DynamicPolyline((time) => {
    const w = updaterWidth(time), y = 1.35, h = 0.22
    return [[-w / 2, y - h], [-w / 2, y], [-0.12, y], [0, y + h], [0.12, y], [w / 2, y], [w / 2, y - h]]
  }, { stroke: WHITE, strokeWidth: 0.03, zIndex: 1 })
  const prefix = new Text('Width =', { fontSize: 25, transform: T(-0.55, 2.05) })
  const number = new DynamicNumber(updaterWidth, {
    fontSize: 25,
    transform: T(0.55, 2.05),
    format: (value) => value.toFixed(2).padStart(5, ' '),
  })
  scene.add(square, brace, prefix, number)
  scene.wait(10)
  return scene
}

function arrowPolygon(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = globalThis.Math.max(1e-6, globalThis.Math.hypot(dx, dy))
  const ux = dx / length, uy = dy / length, nx = -uy, ny = ux
  const tip = globalThis.Math.min(0.22, length * 0.25), shaft = 0.025, half = 0.075
  const bx = b[0] - ux * tip, by = b[1] - uy * tip
  return [
    [a[0] + nx * shaft, a[1] + ny * shaft], [bx + nx * shaft, by + ny * shaft],
    [bx + nx * half, by + ny * half], b, [bx - nx * half, by - ny * half],
    [bx - nx * shaft, by - ny * shaft], [a[0] - nx * shaft, a[1] - ny * shaft],
  ]
}

async function arrowPointing(canvas) {
  const scene = await makeScene(canvas)
  const p1 = [-3, 0]
  const p2 = (t) => { const a = TAU * clamp01(t / 4); return [2 - 2 * globalThis.Math.cos(a), -2 * globalThis.Math.sin(a)] }
  const dot1 = new Circle(0.08, { fill: WHITE, stroke: null, transform: T(...p1) })
  const dot2 = new Circle(0.08, { fill: WHITE, stroke: null })
  const arrow = new DynamicPolyline((time) => arrowPolygon(p1, p2(time)), { closed: true, fill: YELLOW, stroke: null, zIndex: 2 })
  // Python's rendered reference shows the dynamic arrow from t=0 even though
  // the provider is authored after the moving point clip, so keep the same visible lifetime.
  scene.add(dot1, dot2, arrow)
  scene.transformFunction(dot2, (a) => T(2 - 2 * globalThis.Math.cos(TAU * a), -2 * globalThis.Math.sin(TAU * a)), { duration: 4, easing: Easing.LINEAR })
  return scene
}

function movingSquareTransform(t) {
  const segment = globalThis.Math.min(2, globalThis.Math.floor(globalThis.Math.max(0, t) / 2))
  const a = t < 6 ? (t - segment * 2) / 2 : 1
  const u = clamp01(a), x = -6 + 12 * u
  const y = segment >= 1 ? globalThis.Math.sin(u * 4 * PI) : 0
  const rotation = segment >= 2 ? -TAU * u : 0
  return T(x, y, rotation)
}

function squarePoints(side, transform) {
  const h = side / 2
  return [[-h, -h], [h, -h], [h, h], [-h, h]].map((p) => applyTransform(transform, p))
}

async function combineUpdaters(canvas) {
  const scene = await makeScene(canvas)
  const obj = new DynamicPolyline((time) => squarePoints(2, movingSquareTransform(time)), { closed: true, fill: null, stroke: WHITE, strokeWidth: 0.04 })
  scene.add(obj)
  scene.wait(2)
  scene.wait(2)
  scene.style(obj, { to: { fill: null, stroke: BLUE, width: 0.04, worldStroke: true }, duration: 2, easing: Easing.LINEAR })
  return scene
}

async function rotatingPie(canvas) {
  const scene = await makeScene(canvas)
  const colors = [RED, PURPLE, MAROON, GOLD]
  const sectors = colors.map((color, i) => {
    const ang = i * TAU / 4
    const off = [0.05 * globalThis.Math.cos(ang + PI / 4), 0.05 * globalThis.Math.sin(ang + PI / 4)]
    return new Polygon(sectorPoints(ang, TAU / 4, 1.5), { fill: color, stroke: null, transform: T(...off) })
  })
  const pie = new Group(sectors)
  scene.add(pie)
  const base = scene.authoredState(sectors[0]).transform
  scene.parallel((api) => {
    api.transformFunction(pie, (a) => T(0, 0, TAU * a), { duration: 5, easing: Easing.LINEAR })
    api.transformFunction(sectors[0], (a) => T(base.tx + globalThis.Math.sin(PI * a) / globalThis.Math.SQRT2, base.ty + globalThis.Math.sin(PI * a) / globalThis.Math.SQRT2), { duration: 2, easing: Easing.LINEAR, at: 2 })
  })
  return scene
}

async function markedItem(canvas) {
  const scene = await makeScene(canvas)
  const tr = (a) => T(globalThis.Math.sin(4 * PI * a), 0, TAU * a)
  const mark = (local, time) => applyTransform(tr(clamp01(time / 4)), local)
  const square = new Square(2, { stroke: WHITE, strokeWidth: 0.04, fill: null })
  const tri1 = new DynamicPolyline((t) => trianglePoints(mark([0.5, 0], t), 0.2), { closed: true, fill: null, stroke: GREEN, strokeWidth: 0.035, zIndex: 2 })
  const tri2 = new DynamicPolyline((t) => trianglePoints(mark([0, -0.5], t), 0.2), { closed: true, fill: null, stroke: BLUE, strokeWidth: 0.035, zIndex: 2 })
  const d1 = new DynamicCircleSet((t) => [[...mark([0.5, 0], t), 0.055, RED]], { zIndex: 3 })
  const d2 = new DynamicCircleSet((t) => [[...mark([0, -0.5], t), 0.055, RED]], { zIndex: 3 })
  scene.add(square, tri1, tri2, d1, d2)
  scene.transformFunction(square, tr, { duration: 4, easing: Easing.LINEAR })
  return scene
}

function worldPolygonPath(renderer, points) {
  const path = new Path2D()
  points.forEach(([x, y], i) => {
    const [px, py] = renderer.toDevice(x, y)
    if (i === 0) path.moveTo(px, py); else path.lineTo(px, py)
  })
  path.closePath()
  return path
}

function circleDevicePath(renderer, x, y, radius) {
  const [cx, cy] = renderer.toDevice(x, y)
  const path = new Path2D()
  path.arc(cx, cy, radius * renderer.unitSize, 0, TAU)
  return path
}

function drawScreenText(renderer, ctx, text, x, y, basePx, color = WHITE, opacity = 1, weight = 500) {
  const [px, py] = renderer.toDevice(x, y)
  const scale = renderer.canvas.width / 1920
  ctx.save()
  ctx.globalAlpha *= clamp01(opacity)
  ctx.fillStyle = color
  ctx.font = `${weight} ${basePx * scale}px Inter, ui-sans-serif, system-ui`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, px, py)
  ctx.restore()
}

async function frameEffect(canvas) {
  const scene = await makeScene(canvas)
  const effect = new CustomObject2D(({ renderer, ctx, time }) => {
    const angle = TAU * clamp01(time / 8)
    const c = globalThis.Math.cos(angle), s = globalThis.Math.sin(angle)
    const transformPoint = (x, y) => [c * x - s * y, s * x + c * y]
    const scale = renderer.unitSize
    const drawSquare = (index, mode) => {
      const row = globalThis.Math.floor(index / 7), col = index % 7
      const p = transformPoint((col - 3) * 0.62, (3 - row) * 0.62)
      const corners = [[-0.25,-0.25],[0.25,-0.25],[0.25,0.25],[-0.25,0.25]].map(([x,y]) => transformPoint(x,y)).map(([x,y]) => [x+p[0],y+p[1]])
      const path = worldPolygonPath(renderer, corners)
      if (mode === 'even') {
        const [dx, dy] = renderer.toDevice(...p)
        if (time < 2) {
          ctx.fillStyle = 'rgba(80,145,255,.30)'; ctx.strokeStyle = 'rgba(80,145,255,.75)'
        } else {
          const gx = clamp01(dx / renderer.canvas.width), gy = clamp01(dy / renderer.canvas.height)
          ctx.fillStyle = `rgba(80,${globalThis.Math.round(145 * gx)},${globalThis.Math.round(255 * gy)},.30)`
          ctx.strokeStyle = `rgba(80,${globalThis.Math.round(145 * gx)},${globalThis.Math.round(255 * gy)},.75)`
        }
        ctx.fill(path); ctx.lineWidth = 0.025 * scale; ctx.stroke(path)
      } else if (time < 4) {
        ctx.fillStyle = 'rgba(80,145,255,.30)'; ctx.strokeStyle = 'rgba(80,145,255,.75)'
        ctx.fill(path); ctx.lineWidth = 0.025 * scale; ctx.stroke(path)
      } else {
        const offsetWorld = globalThis.Math.sin(time) * 0.02 * (1920 / 135)
        const scan = ((p[1] + 4) * 10 + time) % 1 >= 0.5
        if (scan) {
          ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(255,0,0,.23)'
          ctx.translate(offsetWorld * scale, 0); ctx.fill(path); ctx.restore()
          ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(0,0,255,.23)'
          ctx.translate(-offsetWorld * scale, 0); ctx.fill(path); ctx.restore()
        }
        ctx.fillStyle = 'rgba(0,145,0,.25)'; ctx.fill(path)
        ctx.strokeStyle = 'rgba(80,145,255,.58)'; ctx.lineWidth = 0.025 * scale; ctx.stroke(path)
      }
    }
    for (let i = 0; i < 49; i += 2) drawSquare(i, 'even')
    for (let i = 1; i < 49; i += 2) drawSquare(i, 'odd')
  })
  scene.add(effect)
  scene.wait(8)
  return scene
}

function maskMorphPoints(t, width = 6.1, height = 1.25, radius = 1.25, count = 64) {
  const a = smooth(clamp01(t))
  return Array.from({ length: count }, (_, i) => {
    const angle = TAU * i / count, c = globalThis.Math.cos(angle), s = globalThis.Math.sin(angle)
    const scale = globalThis.Math.min(width / (2 * globalThis.Math.max(globalThis.Math.abs(c), 1e-9)), height / (2 * globalThis.Math.max(globalThis.Math.abs(s), 1e-9)))
    const rx = c * scale, ry = s * scale, cx = c * radius, cy = s * radius
    return [rx + (cx - rx) * a, 0.5 + ry + (cy - ry) * a]
  })
}

function stage1Mask(renderer, ctx, t) {
  const [x0, y0] = renderer.toDevice(-3.125, 0.45 + 0.64)
  const [x1, y1] = renderer.toDevice(3.125, 0.45 - 0.64)
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip()
  const chars = [...'Mask Example!']
  chars.forEach((ch, i) => {
    const start = 0.55 + i * 0.09
    const u = smooth((t - start) / 1.15)
    const y = -1.2 + (0.45 + 1.2) * u
    drawScreenText(renderer, ctx, ch, (i - (chars.length - 1) / 2) * 0.43, y, 112, WHITE)
  })
  ctx.restore()
}

function stage2Mask(renderer, ctx, t) {
  const brownIn = smooth((t - 1.8) / 0.8), brownOut = smooth((t - 7.9) / 0.8)
  const [b0x, b0y] = renderer.toDevice(-1.5, 1.5), [b1x, b1y] = renderer.toDevice(1.5, -1.5)
  ctx.save(); ctx.globalAlpha *= brownIn * (1 - brownOut); ctx.fillStyle = LIGHT_BROWN; ctx.fillRect(b0x, b0y, b1x - b0x, b1y - b0y); ctx.restore()

  let x = 0
  if (t >= 3 && t < 3.9) x = -smooth((t - 3) / 0.9)
  else if (t >= 3.9 && t < 4.8) x = -1 + 2 * smooth((t - 3.9) / 0.9)
  else if (t >= 4.8 && t < 5.7) x = 1 - smooth((t - 4.8) / 0.9)
  const cross = smooth((t - 6.1) / 1)
  const width=renderer.canvas.width,height=renderer.canvas.height
  const content=document.createElement('canvas'),mask=document.createElement('canvas'),soft=document.createElement('canvas')
  for(const c of [content,mask,soft]){c.width=width;c.height=height}
  const cc=content.getContext('2d'),mc=mask.getContext('2d'),sc=soft.getContext('2d')
  drawScreenText(renderer, cc, 'Mask Example!', x, 0, 128, WHITE, 1-cross)
  drawScreenText(renderer, cc, 'The mask should be hold', 0, 0, 108, WHITE, cross)
  mc.fillStyle='#fff'; mc.fill(worldPolygonPath(renderer,maskMorphPoints(t/1.1)))
  const feather=t<2.4?0:10*smooth((t-2.4)/1)
  if(feather>0){sc.filter=`blur(${feather*(width/1920)}px)`;sc.drawImage(mask,0,0);sc.filter='none'}else sc.drawImage(mask,0,0)
  cc.globalCompositeOperation='destination-in';cc.drawImage(soft,0,0);cc.globalCompositeOperation='source-over'
  ctx.drawImage(content,0,0)
}

function stage3Mask(renderer, ctx, t) {
  const p1 = circleDevicePath(renderer, -1, 0, 1.5)
  const p2 = circleDevicePath(renderer, 1, 0, 1.5)

  const fadeOut = 1 - smooth((t - 4.5) / 1)
  ctx.save()
  ctx.globalAlpha *= fadeOut
  ctx.fillStyle = 'rgba(247,217,111,.25)'
  ctx.fill(p1)
  ctx.fill(p2)
  ctx.restore()

  const maskOpacity = smooth((t - 1) / 1)
  let intersectionMix = 0
  if (t >= 2.5 && t < 3) intersectionMix = smooth((t - 2.5) / .5)
  else if (t >= 3 && t < 3.5) intersectionMix = 1
  else if (t >= 3.5 && t < 4) intersectionMix = 1 - smooth((t - 3.5) / .5)

  const textOpacity = fadeOut

  // Before FadeIn(mask_union), the held text is fully visible.
  if (maskOpacity < 1) {
    drawScreenText(
      renderer,
      ctx,
      'Some Example Text Here',
      0,
      0,
      88,
      WHITE,
      textOpacity * (1 - maskOpacity),
    )
  }

  // Union contribution.
  if (maskOpacity > 0 && intersectionMix < 1) {
    ctx.save()
    ctx.globalAlpha *= textOpacity * maskOpacity * (1 - intersectionMix)
    const union = new Path2D()
    union.addPath(p1)
    union.addPath(p2)
    ctx.clip(union)
    drawScreenText(renderer, ctx, 'Some Example Text Here', 0, 0, 88, WHITE)
    ctx.restore()
  }

  // Intersection contribution.
  if (maskOpacity > 0 && intersectionMix > 0) {
    ctx.save()
    ctx.globalAlpha *= textOpacity * maskOpacity * intersectionMix
    ctx.clip(p1)
    ctx.clip(p2)
    drawScreenText(renderer, ctx, 'Some Example Text Here', 0, 0, 88, WHITE)
    ctx.restore()
  }
}

function stage4Mask(renderer, ctx, t, cache) {
  const width = renderer.canvas.width, height = renderer.canvas.height
  if (!cache.content || cache.content.width !== width || cache.content.height !== height) {
    for (const key of ['content', 'mask', 'inside', 'outside']) {
      cache[key] = document.createElement('canvas'); cache[key].width = width; cache[key].height = height
    }
  }
  const content = cache.content, mask = cache.mask, inside = cache.inside, outside = cache.outside
  const cc = content.getContext('2d'), mc = mask.getContext('2d'), ic = inside.getContext('2d'), oc = outside.getContext('2d')
  cc.clearRect(0, 0, width, height)
  const move = 3 * clamp01(t / 5), radius = 0.10 * renderer.unitSize
  const dots = new Path2D()
  for (let j = 20; j >= -39; j--) for (let i = -23; i < 23; i++) {
    const [x, y] = renderer.toDevice(i * 0.3 + 0.15, j * 0.3 + move)
    dots.moveTo(x + radius, y); dots.arc(x, y, radius, 0, TAU)
  }
  cc.fillStyle = PURPLE_E; cc.fill(dots)

  mc.clearRect(0, 0, width, height)
  const scale = width / 1920
  mc.fillStyle = '#fff'; mc.font = `700 ${500 * scale}px Inter, ui-sans-serif, system-ui`; mc.textAlign = 'center'; mc.textBaseline = 'middle'
  mc.fillText('Fashion', width / 2, height / 2)

  ic.clearRect(0, 0, width, height); ic.globalCompositeOperation = 'source-over'; ic.drawImage(content, 0, 0); ic.globalCompositeOperation = 'destination-in'; ic.drawImage(mask, 0, 0); ic.globalCompositeOperation = 'source-over'
  oc.clearRect(0, 0, width, height); oc.globalCompositeOperation = 'source-over'; oc.drawImage(content, 0, 0); oc.globalCompositeOperation = 'destination-out'; oc.drawImage(mask, 0, 0); oc.globalCompositeOperation = 'source-over'
  const q = smooth((t - 4.7) / 0.9)
  ctx.save(); ctx.globalAlpha *= 1 - q; ctx.drawImage(inside, 0, 0); ctx.restore()
  ctx.save(); ctx.globalAlpha *= q; ctx.drawImage(outside, 0, 0); ctx.restore()
}

async function maskExample(canvas) {
  const scene = await makeScene(canvas)
  const cache = {}
  const mask = new CustomObject2D(({ renderer, ctx, time }) => {
    if (time < 4) stage1Mask(renderer, ctx, time)
    else if (time < 13.8) stage2Mask(renderer, ctx, time - 4)
    else if (time < 19.8) stage3Mask(renderer, ctx, time - 13.8)
    else stage4Mask(renderer, ctx, time - 19.8, cache)
  })
  scene.add(mask)
  scene.wait(28.7)
  return scene
}


const SHAPE3D_DURATION = 4

class Grid3D {
  constructor(point, normal, { nu, nv, periodicV }) {
    this.nu = nu; this.nv = nv; this.periodicV = periodicV
    this.points = []; this.normals = []
    for (let j = 0; j < nv; j++) {
      const v = periodicV ? j / nv : j / (nv - 1)
      for (let i = 0; i < nu; i++) {
        const u = i / nu
        this.points.push(point(u, v))
        this.normals.push(normal(u, v).normalized())
      }
    }
  }
  idx(i, j) { return ((j % this.nv) + this.nv) % this.nv * this.nu + ((i % this.nu) + this.nu) % this.nu }
  *cells() {
    const jCount = this.periodicV ? this.nv : this.nv - 1
    for (let j = 0; j < jCount; j++) for (let i = 0; i < this.nu; i++) {
      yield [i, j, [this.idx(i, j), this.idx(i + 1, j), this.idx(i, j + 1), this.idx(i + 1, j + 1)]]
    }
  }
}

function smoothMesh3D(grid) {
  const indices = []
  for (const [, , [a, b, c, d]] of grid.cells()) indices.push(a, c, b, b, c, d)
  return new TriangleMesh(grid.points, grid.normals, indices)
}

function checkerMeshes3D(grid) {
  const vertices = [[], []], normals = [[], []], indices = [[], []]
  for (const [i, j, [a, b, c, d]] of grid.cells()) {
    const side = (i + j) & 1, outV = vertices[side], outN = normals[side], outI = indices[side], base = outV.length
    for (const index of [a, b, c, d]) { outV.push(grid.points[index]); outN.push(grid.normals[index]) }
    outI.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
  }
  return [0, 1].map((k) => new TriangleMesh(vertices[k], normals[k], indices[k]))
}

function ribbonSegment3D(vertices, normals, indices, a, b, width) {
  const delta = b.sub(a)
  if (delta.length <= 1e-9) return
  const direction = delta.normalized(), reference = globalThis.Math.abs(direction.y) < .85 ? new Vec3(0, 1, 0) : new Vec3(1, 0, 0)
  const side = direction.cross(reference).normalized().mul(width * .5)
  const up = direction.cross(side.normalized()).normalized().mul(width * .5)
  for (const offset of [side, up]) {
    const quad = [a.add(offset), b.add(offset), b.sub(offset), a.sub(offset)]
    const normal = quad[1].sub(quad[0]).cross(quad[3].sub(quad[0])).normalized(), base = vertices.length
    vertices.push(...quad); normals.push(normal, normal, normal, normal)
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3, base + 2, base + 1, base, base + 3, base + 2, base)
  }
}

function wireMesh3D(grid, width = .025) {
  const vertices = [], normals = [], indices = []
  for (let j = 0; j < grid.nv; j++) for (let i = 0; i < grid.nu; i++) {
    ribbonSegment3D(vertices, normals, indices, grid.points[grid.idx(i, j)], grid.points[grid.idx(i + 1, j)], width)
  }
  const step = globalThis.Math.max(1, globalThis.Math.floor(grid.nu / 12)), jCount = grid.periodicV ? grid.nv : grid.nv - 1
  for (let i = 0; i < grid.nu; i += step) for (let j = 0; j < jCount; j++) {
    ribbonSegment3D(vertices, normals, indices, grid.points[grid.idx(i, j)], grid.points[grid.idx(i, j + 1)], width)
  }
  return new TriangleMesh(vertices, normals, indices)
}

function dotMesh3D(grid, radius = .045) {
  const vertices = [], normals = [], indices = [], istep = globalThis.Math.max(1, globalThis.Math.floor(grid.nu / 14)), jstep = globalThis.Math.max(1, globalThis.Math.floor(grid.nv / 8))
  const faces = [
    [[radius,0,0],[0,radius,0],[0,0,radius]], [[0,radius,0],[-radius,0,0],[0,0,radius]],
    [[-radius,0,0],[0,-radius,0],[0,0,radius]], [[0,-radius,0],[radius,0,0],[0,0,radius]],
    [[0,radius,0],[radius,0,0],[0,0,-radius]], [[-radius,0,0],[0,radius,0],[0,0,-radius]],
    [[0,-radius,0],[-radius,0,0],[0,0,-radius]], [[radius,0,0],[0,-radius,0],[0,0,-radius]],
  ].map((face) => face.map((p) => new Vec3(...p)))
  for (let j = 0; j < grid.nv; j += jstep) for (let i = 0; i < grid.nu; i += istep) {
    const center = grid.points[grid.idx(i, j)]
    for (const [oa, ob, oc] of faces) {
      const a = center.add(oa), b = center.add(ob), c = center.add(oc), normal = b.sub(a).cross(c.sub(a)).normalized(), base = vertices.length
      vertices.push(a, b, c); normals.push(normal, normal, normal); indices.push(base, base + 1, base + 2)
    }
  }
  return new TriangleMesh(vertices, normals, indices)
}

function torusGrid3D() {
  const major = 2, minor = 1
  return new Grid3D(
    (u, v) => new Vec3((major + minor * globalThis.Math.cos(TAU * v)) * globalThis.Math.cos(TAU * u), (major + minor * globalThis.Math.cos(TAU * v)) * globalThis.Math.sin(TAU * u), minor * globalThis.Math.sin(TAU * v)),
    (u, v) => new Vec3(globalThis.Math.cos(TAU * v) * globalThis.Math.cos(TAU * u), globalThis.Math.cos(TAU * v) * globalThis.Math.sin(TAU * u), globalThis.Math.sin(TAU * v)),
    { nu: 28, nv: 14, periodicV: true },
  )
}

function cylinderGrid3D() {
  const radius = 2, height = 4
  return new Grid3D(
    (u, v) => new Vec3(radius * globalThis.Math.cos(TAU * u), height * (v - .5), radius * globalThis.Math.sin(TAU * u)),
    (u) => new Vec3(globalThis.Math.cos(TAU * u), 0, globalThis.Math.sin(TAU * u)),
    { nu: 28, nv: 9, periodicV: false },
  )
}

function coneGrid3D() {
  const radius = 2, height = 4
  return new Grid3D(
    (u, v) => new Vec3(radius * (.025 + .975 * v) * globalThis.Math.cos(TAU * u), height * (.5 - v), radius * (.025 + .975 * v) * globalThis.Math.sin(TAU * u)),
    (u) => new Vec3(height * globalThis.Math.cos(TAU * u), radius, height * globalThis.Math.sin(TAU * u)),
    { nu: 28, nv: 9, periodicV: false },
  )
}

function panelSplit(time) {
  return smooth(clamp01(time - 1))
}

function panelCenter(time, center) {
  const a = panelSplit(time)
  return new Vec3(center.x * a, center.y * a, 0)
}

function panelScale(time) {
  return 1 - .5 * panelSplit(time)
}

function shape3DOpacity(time, start, styleIndex) {
  if (time < start || time >= start + SHAPE3D_DURATION) return 0
  if (styleIndex > 0 && time < 1) return 0

  let opacity = 1
  if (styleIndex > 0 && time < 1.25) opacity *= smooth((time - 1) / .25)
  if (time < start + .12) opacity *= smooth((time - start) / .12)
  if (time >= start + SHAPE3D_DURATION - .12) {
    opacity *= 1 - smooth((time - (start + SHAPE3D_DURATION - .12)) / .12)
  }
  return clamp01(opacity)
}

function shape3DRotation(time, start) {
  const a = clamp01((time - start) / SHAPE3D_DURATION)
  return Transform3D.rotationZ(-TAU * a)
    .mul(Transform3D.rotationX(-TAU * a - .38))
    .mul(Transform3D.rotationY(.45))
}

function shape3DTransform(time, center, start) {
  const c = panelCenter(time, center)
  const scale = panelScale(time)
  return Transform3D.translation(c.x, c.y, 0)
    .mul(Transform3D.scaling(scale))
    .mul(shape3DRotation(time, start))
}

function styleMeshes3D(grid, styleName, center, start, styleIndex) {
  const common = (mesh, color) => new MeshObject3D(mesh, {
    color,
    transform: (time) => shape3DTransform(time, center, start),
    opacity: (time) => shape3DOpacity(time, start, styleIndex),
  })
  if (styleName === 'checker') {
    const [a, b] = checkerMeshes3D(grid)
    return [common(a, '#2a64cd'), common(b, '#69b1ff')]
  }
  if (styleName === 'wire') return [common(wireMesh3D(grid, .04), '#68b2ff')]
  if (styleName === 'smooth') return [common(smoothMesh3D(grid), '#58a6f2')]
  if (styleName === 'dots') return [common(dotMesh3D(grid, .08), '#7dbcff')]
  throw new Error(styleName)
}

function smoothAxes3D(center) {
  const white = '#ffffff'
  const thin = .025
  const axes = [
    new Box3D(new Vec3(6, thin, thin), { color: white }),
    new Box3D(new Vec3(6, thin, thin), {
      color: white,
      geometryTransform: Transform3D.rotationZ(PI / 2),
    }),
    new Box3D(new Vec3(6, thin, thin), {
      color: white,
      geometryTransform: Transform3D.rotationY(-PI / 2),
    }),
  ]
  return axes.map((axis) => {
    axis.transform = (time) => {
      const local = globalThis.Math.max(0, time % SHAPE3D_DURATION)
      const c = panelCenter(time, center)
      const scale = panelScale(time)
      return Transform3D.translation(c.x, c.y, 0)
        .mul(Transform3D.scaling(scale))
        .mul(shape3DRotation(local, 0))
    }
    axis.opacity = (time) => {
      if (time < 1) return 0
      return smooth(clamp01((time - 1) / .35))
    }
    return axis
  })
}


async function threeDShapesExample(canvas) {
  const scene = await makeScene(canvas)
  const fullW = 1920 / 135
  const fullH = 1080 / 135
  const panelW = fullW / 2
  const panelH = fullH / 2
  const centers = [
    new Vec3(-panelW / 2, panelH / 2, 0),
    new Vec3(panelW / 2, panelH / 2, 0),
    new Vec3(-panelW / 2, -panelH / 2, 0),
    new Vec3(panelW / 2, -panelH / 2, 0),
  ]
  const backgrounds = ['#000022', '#000033', '#000033', '#000022']

  const background = new DynamicRectSet((time) => {
    if (time < 1) return [[0, 0, fullW, fullH, backgrounds[0], null, 0]]
    const a = panelSplit(time)
    const scale = 1 - .5 * a
    return centers.map((center, i) => [
      center.x * a,
      center.y * a,
      fullW * scale,
      fullH * scale,
      backgrounds[i],
      null,
      0,
    ])
  }, { zIndex: -10 })
  scene.add(background)

  const styles = ['checker', 'wire', 'smooth', 'dots']
  const grids = [torusGrid3D(), cylinderGrid3D(), coneGrid3D()]
  const meshes = []

  grids.forEach((grid, shapeIndex) => {
    const start = shapeIndex * SHAPE3D_DURATION
    styles.forEach((styleName, styleIndex) => {
      meshes.push(...styleMeshes3D(grid, styleName, centers[styleIndex], start, styleIndex))
    })
  })

  meshes.push(...smoothAxes3D(centers[2]))

  const camera = new Camera3D({
    position: new Vec3(0, 0, 15),
    target: new Vec3(),
    up: new Vec3(0, 1, 0),
    orthographicHeight: 8,
    layerZIndex: 0,
  })
  scene.add(new Scene3DLayer(meshes, {
    camera,
    resolution: 1,
    maxWidth: 1280,
    maxHeight: 720,
    zIndex: 0,
  }))

  scene.wait(12)
  return scene
}


function janimBallSimulationTime(time) {
  if (time <= 4) return time
  if (time < 6) return 4
  return globalThis.Math.min(10, time - 2)
}

function janimBallFrame(data, sceneTime) {
  const simulationTime = janimBallSimulationTime(sceneTime)
  const index = globalThis.Math.max(
    0,
    globalThis.Math.min(
      data.frames.length - 1,
      globalThis.Math.round(simulationTime * data.fps),
    ),
  )
  return data.frames[index]
}

async function ballsCollisionExample(canvas) {
  const data = (await generatedData()).janimBalls
  const scene = await makeScene(canvas, { background: '#000000', fps: 60 })

  const arena = new Rectangle(8, 6, {
    fill: alpha(BLUE, .2),
    stroke: BLUE,
  })

  const balls = new DynamicCircleSet((time) => {
    const frame = janimBallFrame(data, time)
    return frame.map(([x, y], index) => {
      const selected = index === 6
      const color = selected
        ? lerpHex(BLUE, YELLOW, smooth(clamp01((time - 4.5) / 1)))
        : BLUE
      return [x, y, .25, color]
    })
  }, { zIndex: 1 })

  scene.add(arena, balls)

  const target = data.frames[4 * data.fps][6]
  scene.wait(4.5)
  scene.camera.transformFunction((a) => {
    const scale = 1 + a
    const cx = target[0] * a
    const cy = target[1] * a
    return T(-scale * cx, -scale * cy, 0, scale)
  }, { duration: 1 })

  scene.wait(.5)
  scene.camera.transformFunction((a) => {
    const frameIndex = globalThis.Math.min(
      data.frames.length - 1,
      globalThis.Math.round((4 + 6 * a) * data.fps),
    )
    const [cx, cy] = data.frames[frameIndex][6]
    return T(-2 * cx, -2 * cy, 0, 2)
  }, { duration: 6, easing: Easing.LINEAR })

  return scene
}

export const janimScenes = [
  { id: 'janim-hello', title: 'JAnim · Hello', source: 'janim/suite.py · HelloJAnimExample', width: 1920, height: 1080, builder: helloJAnim },
  { id: 'janim-basic', title: 'JAnim · Basic animation', source: 'janim/suite.py · BasicAnimationExample', width: 1920, height: 1080, builder: basicAnimation },
  { id: 'janim-text', title: 'JAnim · Text', source: 'janim/suite.py · TextExample', width: 1920, height: 1080, builder: textExample, note: 'Text reveal timing follows the Python example.' },
  { id: 'janim-typst', title: 'JAnim · Typst', source: 'janim/suite.py · TypstExample', width: 1920, height: 1080, builder: typstExample },
  { id: 'janim-colorize', title: 'JAnim · Typst colorize', source: 'janim/suite.py · TypstColorizeExample', width: 1920, height: 1080, builder: typstColorize },
  { id: 'janim-pi', title: 'JAnim · Animating π', source: 'janim/suite.py · AnimatingPiExample', width: 1920, height: 1080, builder: animatingPi, note: 'The browser rebuilds the 100-glyph VectorDocument and applies the same piecewise color, affine, exp and wave maps at absolute scene time.' },
  { id: 'janim-plane', title: 'JAnim · Number plane', source: 'janim/suite.py · NumberPlaneExample', width: 1920, height: 1080, builder: numberPlane },
  { id: 'janim-updater', title: 'JAnim · Updater', source: 'janim/suite.py · UpdaterExample', width: 1920, height: 1080, builder: updaterExample },
  { id: 'janim-arrow', title: 'JAnim · Arrow pointing', source: 'janim/suite.py · ArrowPointingExample', width: 1920, height: 1080, builder: arrowPointing },
  { id: 'janim-combine', title: 'JAnim · Combine updaters', source: 'janim/suite.py · CombineUpdatersExample', width: 1920, height: 1080, builder: combineUpdaters },
  { id: 'janim-pie', title: 'JAnim · Rotating pie', source: 'janim/suite.py · RotatingPieExample', width: 1920, height: 1080, builder: rotatingPie },
  { id: 'janim-marked', title: 'JAnim · Marked item', source: 'janim/suite.py · MarkedItemExample', width: 1920, height: 1080, builder: markedItem },
  { id: 'janim-frame-effect', title: 'JAnim · Frame effect', source: 'janim/frame_effect_example.py · FrameEffectExample', width: 1920, height: 1080, builder: frameEffect, note: 'Recreated with the public CustomObject2D Canvas API: identical 8 s rotation and effect onset times, browser-native channel/scanline compositing.' },
  { id: 'janim-mask', title: 'JAnim · Mask', source: 'janim/mask_example.py · MaskExample', width: 1920, height: 1080, builder: maskExample, note: 'Four mask stages, original timing, boolean masks, and stage-two feathering are preserved.' },
  { id: 'janim-3d-shapes', title: 'JAnim · 3D shapes', source: 'janim/three_d_shapes_example.py · ThreeDShapesExample', width: 1920, height: 1080, builder: threeDShapesExample, note: 'Real WASM depth rasterization using the same camera/projection conventions as Native Zanim; torus, cylinder and cone keep the original 3 × 4 s timing.' },
  { id: 'janim-balls', title: 'JAnim · Balls collision', source: 'janim/balls_collision_example.py · BallsCollisionExample', width: 1920, height: 1080, builder: ballsCollisionExample, note: '60 Hz deterministic simulation matching JAnim\'s seed, pause, zoom, highlight, and follow-camera timeline.' },
]
