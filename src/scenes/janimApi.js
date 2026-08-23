import {
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
  Polygon,
  Polyline,
  Row,
  Scene,
  Square,
  TAU,
  Text,
  Transform2D,
  VectorObject2D,
} from '@zanim/web'

const WHITE = '#eef1f7'
const BLUE = '#5091ff'
const BLUE_E = '#224b87'
const GREEN = '#50d287'
const RED = '#f55262'
const YELLOW = '#fad24e'
const GOLD = '#f5b437'
const ORANGE = '#f58737'
const PURPLE = '#aa64e6'
const MAROON = '#b94669'
const LIGHT_BROWN = '#b78b64'
const PURPLE_E = '#5c3782'
const MUTED = '#919eb8'
const PI = Math.PI
const smooth = Easing.SMOOTHSTEP
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const alpha = (hex, a) => `${hex}${Math.round(clamp01(a) * 255).toString(16).padStart(2, '0')}`
const T = (x = 0, y = 0, rotation = 0, scale = 1) => Transform2D.affine({ position: [x, y], rotation, scale })
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

async function makeScene(canvas) {
  const rect = canvas.getBoundingClientRect()
  const scale = Math.max(0.2, rect.width / 1920)
  return Scene.create(canvas, {
    fps: 30,
    renderer: { unitSize: 135 * scale, background: '#0e1118' },
  })
}

function colorCSS(value) {
  if (value == null || typeof value === 'string') return value
  const [r, g, b, a = 255] = value.map(Number)
  return `rgba(${r},${g},${b},${a / 255})`
}

function webDocument(raw) {
  return {
    width: Number(raw.width),
    height: Number(raw.height),
    group_count: Number(raw.group_count ?? 1),
    paths: raw.paths.map((path) => ({
      group: Number(path.group ?? 0),
      fill: colorCSS(path.fill),
      stroke: path.stroke ? { color: colorCSS(path.stroke.color), width: Number(path.stroke.width) } : null,
      contours: path.contours.map((contour) => ({
        closed: !!contour.closed,
        segments: contour.segments.map((segment) => segment.map((point) => [Number(point[0]), Number(point[1])])),
      })),
    })),
  }
}

let vectorCachePromise = null
function vectorCache() {
  vectorCachePromise ??= fetch(asset('janim-api-vectors.json')).then((response) => {
    if (!response.ok) throw new Error(`janim vector cache failed (${response.status})`)
    return response.json()
  })
  return vectorCachePromise
}

function cachedMath(cache, key, source, options = {}) {
  return new ZMath(source, {
    ...options,
    compiler: async () => ({ document: cache[key] }),
  })
}

function starPoints(outer = 1, inner = 0.45, count = 5, phase = PI / 2) {
  return Array.from({ length: count * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner
    const a = phase + i * PI / count
    return [r * Math.cos(a), r * Math.sin(a)]
  })
}

function sectorPoints(start, sweep, radius, center = [0, 0], samples = 30) {
  return [center, ...Array.from({ length: samples + 1 }, (_, i) => {
    const a = start + sweep * i / samples
    return [center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)]
  })]
}

function trianglePoints(center, radius, phase = PI / 2) {
  return Array.from({ length: 3 }, (_, i) => {
    const a = phase + TAU * i / 3
    return [center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)]
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
    width: Math.max(...documents.map((doc) => doc.width)),
    height: Math.max(...documents.map((doc) => doc.height)),
    group_count: 1,
    paths: documents.flatMap((doc) => doc.paths.map((path) => ({ ...path, group: 0 }))),
  }
}

function lerpHex(a, b, t) {
  const parse = (value) => [1, 3, 5].map((i) => Number.parseInt(value.slice(i, i + 2), 16))
  const x = parse(a), y = parse(b), u = clamp01(t)
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * u)).join(',')})`
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
  scene.transformFunction(star, (a) => T(0, 0, TAU * a, 1.5 * a), { duration: 1 })
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
  const title = new Text('Here is some text', { fontSize: 64, opacity: 0, transform: T(0, 0.7) })
  const d0 = richLine([['You can also apply ', WHITE, 1], ['styles', BLUE, 1], [' to the text.', WHITE, 1]], -0.6)
  const d1 = richLine([['You can also apply ', WHITE, 1], ['styles', GREEN, 1.4], [' to the text.', WHITE, 1]], -0.6)
  scene.add(title, ...d0, ...d1)
  scene.wait(1)
  scene.fadeIn(title, { duration: 1 })
  scene.parallel(1, (api) => d0.forEach((item) => api.fadeIn(item)))
  scene.parallel(1, (api) => {
    d0.forEach((item) => api.fadeOut(item))
    d1.forEach((item) => api.fadeIn(item))
  })
  scene.wait(1)
  return scene
}

async function typstExample(canvas) {
  const scene = await makeScene(canvas)
  const cache = await vectorCache()
  const lines = [
    new Text('Zanim provides Text and Math classes to insert Typst content.', { fontSize: 27, opacity: 0 }),
    new Text('Math expressions are also supported.', { fontSize: 27, opacity: 0 }),
    cachedMath(cache, 'math:A', 'A = pi r^2', { fontSize: 34, color: WHITE, reveal: 0 }),
    cachedMath(cache, 'math:area', '"area" = pi dot "radius"^2', { fontSize: 34, color: WHITE, reveal: 0 }),
    cachedMath(cache, 'math:set', 'cal(A) := { x in RR | x "is natural" }', { fontSize: 31, color: WHITE, reveal: 0 }),
    cachedMath(cache, 'math:less', '5 < 17', { fontSize: 34, color: WHITE, reveal: 0 }),
    new Text('Vector documents can also be composed as a full Typst-style document.', { fontSize: 26, opacity: 0 }),
  ]
  await Promise.all(lines.filter((item) => item.ready).map((item) => item.ready))
  new Column({ gap: 0.25, at: [0, 0.3] }).place(...lines)
  scene.add(...lines)
  scene.parallel((api) => {
    lines.forEach((item, i) => {
      if (item instanceof VectorObject2D) api.create(item, { duration: 3.2, at: i * 0.12 })
      else api.fadeIn(item, { duration: 3.2, at: i * 0.12 })
    })
  })
  scene.wait(1)
  scene.parallel(1, (api) => lines.forEach((item) => api.fadeOut(item)))

  const cells = [
    new Text('TypstText', { fontSize: 34, color: BLUE, opacity: 0, transform: T(-3, 0.8) }),
    new Text('This is a sentence with a math expression f(x)=x²', { fontSize: 27, opacity: 0, transform: T(3, 0.8) }),
    new Text('TypstMath', { fontSize: 34, color: BLUE, opacity: 0, transform: T(-3, -0.8) }),
    cachedMath(cache, 'math:sum', 'sum_(i=1)^n x_i = x_1 + x_2 + dots.c + x_n', { fontSize: 31, color: WHITE, reveal: 0, transform: T(3, -0.8) }),
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
  const cache = await vectorCache()
  const tokens = ['cos', 'space^2', 'theta', '+', 'sin', 'space^2', 'theta', '=', '1']
  const objs = tokens.map((token) => cachedMath(cache, `token:${token}:white`, token, { fontSize: 95, color: WHITE }))
  await Promise.all(objs.map((obj) => obj.ready))
  new Row({ gap: 0.04, at: [0, 0] }).place(...objs)
  scene.add(...objs)
  scene.wait(1)

  async function recolor(index, colorName, color) {
    const old = objs[index]
    const next = cachedMath(cache, `token:${tokens[index]}:${colorName}`, tokens[index], {
      fontSize: 95, color, opacity: 0, transform: old.transform,
    })
    await next.ready
    scene.add(next)
    scene.parallel(1, (api) => { api.fadeOut(old); api.fadeIn(next) })
    objs[index] = next
  }
  await recolor(0, 'blue', BLUE)
  await recolor(4, 'blue', BLUE)
  await recolor(2, 'gold', GOLD)
  await recolor(6, 'orange', ORANGE)
  scene.wait(1)

  async function recolorMany(indices, colorName, color) {
    const replacements = indices.map((index) => {
      const old = objs[index]
      const next = cachedMath(cache, `token:${tokens[index]}:${colorName}`, tokens[index], {
        fontSize: 95, color, opacity: 0, transform: old.transform,
      })
      return { index, old, next }
    })
    await Promise.all(replacements.map(({ next }) => next.ready))
    scene.add(...replacements.map(({ next }) => next))
    scene.parallel(1, (api) => replacements.forEach(({ old, next }) => { api.fadeOut(old); api.fadeIn(next) }))
    replacements.forEach(({ index, next }) => { objs[index] = next })
  }
  await recolorMany([2, 6], 'green', GREEN)
  await recolorMany([1, 5], 'red', RED)
  scene.wait(1)
  return scene
}

async function animatingPi(canvas) {
  const scene = await makeScene(canvas)
  const cache = await vectorCache()
  const glyph = webDocument(cache['pi:white'])
  const placed = []
  for (let row = 0; row < 10; row++) for (let col = 0; col < 10; col++) {
    const dx = (col - 4.5) * 0.68, dy = (4.5 - row) * 0.62
    placed.push(mapDocument(glyph, ([x, y]) => [x + dx, y + dy]))
  }
  const base = mergeDocuments(placed)
  const shift = Transform2D.translation(-1, 0)
  const fit = Transform2D.scaling(0.66 / 0.68, 0.66 / 0.62)
  const fittedBlue = mapDocument(recolorDocument(base, BLUE), (point) => applyTransform(fit, point))
  const expPoint = ([x, y]) => { const m = Math.exp(x); return [m * Math.cos(y), m * Math.sin(y)] }
  const wavePoint = ([x, y]) => [x + 0.5 * Math.sin(y), y + 0.5 * Math.sin(x)]
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
  for (let x = -7; x <= 7; x++) lines.push(new Polyline([[x, -4], [x, 4]], { stroke: 'rgba(95,105,130,.47)', strokeWidth: 0.012, trim: 0 }))
  for (let y = -4; y <= 4; y++) lines.push(new Polyline([[-7, y], [7, y]], { stroke: 'rgba(95,105,130,.47)', strokeWidth: 0.012, trim: 0 }))
  const plane = new Group(lines)
  const graphPoints = Array.from({ length: 320 }, (_, i) => {
    const x = -7 + 14 * i / 319
    return [x, Math.sin(x)]
  })
  const graph = new Polyline(graphPoints, { stroke: BLUE, strokeWidth: 0.035, trim: 0 })
  scene.add(plane, graph)
  scene.wait(0.2)
  scene.parallel((api) => lines.forEach((line, i) => api.create(line, { duration: 1.2, at: i * 0.03 })))
  scene.create(graph, { duration: 1 })
  scene.wait(1)
  const matrix = new Transform2D(3, -1, 1, 2, 0, 0)
  scene.parallel(2, (api) => { api.animate(plane, { transform: matrix }); api.animate(graph, { transform: matrix }) })
  scene.wait(1)
  return scene
}

function updaterWidth(t) {
  if (t < 1) return 2
  if (t < 2) return 2 * (1 + (t - 1))
  if (t < 3) return 4 * (1 - 0.5 * (t - 2))
  if (t < 4) return 2 + 3 * (t - 3)
  if (t < 9) { const a = (t - 4) / 5; return 5 + 2.5 * Math.sin(a * 5) }
  return 5
}

async function updaterExample(canvas) {
  const scene = await makeScene(canvas)
  const square = new DynamicRectSet((time) => [[0, 0, Math.max(0.05, updaterWidth(time)), 2, BLUE_E, null, 0]], { zIndex: 0 })
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
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.max(1e-6, Math.hypot(dx, dy))
  const ux = dx / length, uy = dy / length, nx = -uy, ny = ux
  const tip = Math.min(0.22, length * 0.25), shaft = 0.025, half = 0.075
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
  const p2 = (t) => { const a = TAU * clamp01(t / 4); return [2 - 2 * Math.cos(a), -2 * Math.sin(a)] }
  const dot1 = new Circle(0.08, { fill: WHITE, stroke: null, transform: T(...p1) })
  const dot2 = new Circle(0.08, { fill: WHITE, stroke: null })
  const arrow = new DynamicPolyline((time) => arrowPolygon(p1, p2(time)), { closed: true, fill: YELLOW, stroke: null, zIndex: 2 })
  // Python's rendered reference shows the dynamic arrow from t=0 even though
  // the provider is authored after the moving point clip, so keep the same visible lifetime.
  scene.add(dot1, dot2, arrow)
  scene.transformFunction(dot2, (a) => T(2 - 2 * Math.cos(TAU * a), -2 * Math.sin(TAU * a)), { duration: 4, easing: Easing.LINEAR })
  return scene
}

function movingSquareTransform(t) {
  const segment = Math.min(2, Math.floor(Math.max(0, t) / 2))
  const a = t < 6 ? (t - segment * 2) / 2 : 1
  const u = clamp01(a), x = -6 + 12 * u
  const y = segment >= 1 ? Math.sin(u * 4 * PI) : 0
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
    const off = [0.05 * Math.cos(ang + PI / 4), 0.05 * Math.sin(ang + PI / 4)]
    return new Polygon(sectorPoints(ang, TAU / 4, 1.5), { fill: color, stroke: null, transform: T(...off) })
  })
  const pie = new Group(sectors)
  scene.add(pie)
  const base = sectors[0].transform
  scene.parallel((api) => {
    api.transformFunction(pie, (a) => T(0, 0, TAU * a), { duration: 5, easing: Easing.LINEAR })
    api.transformFunction(sectors[0], (a) => T(base.tx + Math.sin(PI * a) / Math.SQRT2, base.ty + Math.sin(PI * a) / Math.SQRT2), { duration: 2, easing: Easing.LINEAR, at: 2 })
  })
  return scene
}

async function markedItem(canvas) {
  const scene = await makeScene(canvas)
  const tr = (a) => T(Math.sin(4 * PI * a), 0, TAU * a)
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
    const c = Math.cos(angle), s = Math.sin(angle)
    const transformPoint = (x, y) => [c * x - s * y, s * x + c * y]
    const scale = renderer.unitSize
    const drawSquare = (index, mode) => {
      const row = Math.floor(index / 7), col = index % 7
      const p = transformPoint((col - 3) * 0.62, (3 - row) * 0.62)
      const corners = [[-0.25,-0.25],[0.25,-0.25],[0.25,0.25],[-0.25,0.25]].map(([x,y]) => transformPoint(x,y)).map(([x,y]) => [x+p[0],y+p[1]])
      const path = worldPolygonPath(renderer, corners)
      if (mode === 'even') {
        const [dx, dy] = renderer.toDevice(...p)
        if (time < 2) {
          ctx.fillStyle = 'rgba(80,145,255,.30)'; ctx.strokeStyle = 'rgba(80,145,255,.75)'
        } else {
          const gx = clamp01(dx / renderer.canvas.width), gy = clamp01(dy / renderer.canvas.height)
          ctx.fillStyle = `rgba(80,${Math.round(145 * gx)},${Math.round(255 * gy)},.30)`
          ctx.strokeStyle = `rgba(80,${Math.round(145 * gx)},${Math.round(255 * gy)},.75)`
        }
        ctx.fill(path); ctx.lineWidth = 0.025 * scale; ctx.stroke(path)
      } else if (time < 4) {
        ctx.fillStyle = 'rgba(80,145,255,.30)'; ctx.strokeStyle = 'rgba(80,145,255,.75)'
        ctx.fill(path); ctx.lineWidth = 0.025 * scale; ctx.stroke(path)
      } else {
        const offsetWorld = Math.sin(time) * 0.02 * (1920 / 135)
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
    const angle = TAU * i / count, c = Math.cos(angle), s = Math.sin(angle)
    const scale = Math.min(width / (2 * Math.max(Math.abs(c), 1e-9)), height / (2 * Math.max(Math.abs(s), 1e-9)))
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
  const maskPath = worldPolygonPath(renderer, maskMorphPoints(t / 1.1))
  ctx.save(); ctx.clip(maskPath)
  drawScreenText(renderer, ctx, 'Mask Example!', x, 0, 128, WHITE, 1 - cross)
  drawScreenText(renderer, ctx, 'The mask should be hold', 0, 0, 108, WHITE, cross)
  ctx.restore()
}

function stage3Mask(renderer, ctx, t) {
  const p1 = circleDevicePath(renderer, -1, 0, 1.5), p2 = circleDevicePath(renderer, 1, 0, 1.5)
  ctx.save(); ctx.fillStyle = 'rgba(248,210,68,.25)'; ctx.fill(p1); ctx.fill(p2); ctx.restore()
  const intersection = t >= 1.8 && t < 3
  ctx.save()
  if (intersection) { ctx.clip(p1); ctx.clip(p2) }
  else { const union = new Path2D(); union.addPath(p1); union.addPath(p2); ctx.clip(union) }
  drawScreenText(renderer, ctx, 'Some Example Text Here', 0, 0, 88, WHITE)
  ctx.restore()
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

export const janimApiScenes = [
  { id: 'janim-hello', title: 'JAnim · Hello', source: 'janim_api/suite.py · HelloJAnimExample', width: 1920, height: 1080, builder: helloJAnim },
  { id: 'janim-basic', title: 'JAnim · Basic animation', source: 'janim_api/suite.py · BasicAnimationExample', width: 1920, height: 1080, builder: basicAnimation },
  { id: 'janim-text', title: 'JAnim · Text', source: 'janim_api/suite.py · TextExample', width: 1920, height: 1080, builder: textExample, note: 'Browser Text has no glyph-by-glyph trim channel, so the title uses the same one-second appearance span as an opacity reveal.' },
  { id: 'janim-typst', title: 'JAnim · Typst', source: 'janim_api/suite.py · TypstExample', width: 1920, height: 1080, builder: typstExample },
  { id: 'janim-colorize', title: 'JAnim · Typst colorize', source: 'janim_api/suite.py · TypstColorizeExample', width: 1920, height: 1080, builder: typstColorize },
  { id: 'janim-pi', title: 'JAnim · Animating π', source: 'janim_api/suite.py · AnimatingPiExample', width: 1920, height: 1080, builder: animatingPi, note: 'The browser rebuilds the 100-glyph VectorDocument and applies the same piecewise color, affine, exp and wave maps at absolute scene time.' },
  { id: 'janim-plane', title: 'JAnim · Number plane', source: 'janim_api/suite.py · NumberPlaneExample', width: 1920, height: 1080, builder: numberPlane },
  { id: 'janim-updater', title: 'JAnim · Updater', source: 'janim_api/suite.py · UpdaterExample', width: 1920, height: 1080, builder: updaterExample },
  { id: 'janim-arrow', title: 'JAnim · Arrow pointing', source: 'janim_api/suite.py · ArrowPointingExample', width: 1920, height: 1080, builder: arrowPointing },
  { id: 'janim-combine', title: 'JAnim · Combine updaters', source: 'janim_api/suite.py · CombineUpdatersExample', width: 1920, height: 1080, builder: combineUpdaters },
  { id: 'janim-pie', title: 'JAnim · Rotating pie', source: 'janim_api/suite.py · RotatingPieExample', width: 1920, height: 1080, builder: rotatingPie },
  { id: 'janim-marked', title: 'JAnim · Marked item', source: 'janim_api/suite.py · MarkedItemExample', width: 1920, height: 1080, builder: markedItem },
  { id: 'janim-frame-effect', title: 'JAnim · Frame effect', source: 'janim_api/frame_effect_example.py', width: 1920, height: 1080, builder: frameEffect, note: 'Recreated with the public CustomObject2D Canvas API: identical 8 s rotation and effect onset times, browser-native channel/scanline compositing.' },
  { id: 'janim-mask', title: 'JAnim · Mask', source: 'janim_api/mask_example.py', width: 1920, height: 1080, builder: maskExample, note: 'Four mask stages and their original 4.0 + 9.8 + 6.0 + 8.9 s timing are preserved. Stage-two feathering is approximated by a hard browser clip.' },
]
