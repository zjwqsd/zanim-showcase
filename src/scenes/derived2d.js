import {
  BLUE,
  CircleSet,
  DynamicCircleSet,
  DynamicLineSet,
  DynamicTextSet,
  GREEN,
  LineSet,
  ORANGE,
  PURPLE,
  RED,
  Scene,
  Square,
  Transform2D,
  WHITE,
  YELLOW,
} from '@zanim/web'

const BASE = import.meta.env.BASE_URL

const T = (x = 0, y = 0, rotation = 0, scale = 1) =>
  Transform2D.affine({ position: [x, y], rotation, scale })

let generatedPromise = null
function generatedData() {
  if (!generatedPromise) {
    generatedPromise = fetch(`${BASE}generated/gallery-data.json`).then((response) => {
      if (!response.ok) throw new Error(`gallery data: HTTP ${response.status}`)
      return response.json()
    })
  }
  return generatedPromise
}

async function makeScene(canvas, { width = 1280, unitSize = 95, background = '#080b12' } = {}) {
  const rect = canvas.getBoundingClientRect()
  const scale = Math.max(0.2, rect.width / width)
  return Scene.create(canvas, {
    fps: 60,
    renderer: { unitSize: unitSize * scale, background },
  })
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function smoothstep(value) {
  const x = clamp01(value)
  return x * x * (3 - 2 * x)
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// -----------------------------------------------------------------------------
// Moving electric field
// -----------------------------------------------------------------------------

const FIELD_RADIUS = 0.23
const FIELD_OMEGA = 2 * Math.PI / 7.8

function chargePositions(time) {
  const theta = FIELD_OMEGA * time
  const x = 1.65 * Math.cos(theta)
  const y = 0.72 * Math.sin(theta)
  return [[-x, -y], [x, y]]
}

function electricField(x, y, time) {
  const [positive, negative] = chargePositions(time)
  let ex = 0
  let ey = 0
  for (const [center, charge] of [[positive, 1], [negative, -1]]) {
    const dx = x - center[0]
    const dy = y - center[1]
    const r2 = dx * dx + dy * dy + 0.055 ** 2
    const f = charge / (r2 * Math.sqrt(r2))
    ex += dx * f
    ey += dy * f
  }
  return [ex, ey]
}

function fieldVectorItems(time) {
  const fadeIn = smoothstep((time - 0.45) / 0.8)
  const fadeOut = 1 - smoothstep((time - 3.15) / 0.9)
  const opacity = Math.max(0, fadeIn * fadeOut)
  const items = []
  for (let y = -2.4; y <= 2.401; y += 0.6) {
    for (let x = -5.1; x <= 5.101; x += 0.6) {
      const [ex, ey] = electricField(x, y, time)
      const mag = Math.hypot(ex, ey)
      if (mag < 1e-7) continue
      const nx = ex / mag
      const ny = ey / mag
      const strength = mag / (mag + 0.55)
      const length = 0.31
      const alpha = opacity * (0.25 + 0.65 * strength)
      const color = `rgba(93,176,255,${alpha.toFixed(4)})`
      items.push([x, y, x + nx * length, y + ny * length, color, 0.017])
      const tx = x + nx * length
      const ty = y + ny * length
      const bx = tx - nx * 0.09
      const by = ty - ny * 0.09
      items.push([tx, ty, bx - ny * 0.075, by + nx * 0.075, color, 0.014])
      items.push([tx, ty, bx + ny * 0.075, by - nx * 0.075, color, 0.014])
    }
  }
  return items
}

function streamlineItems(time) {
  const fade = smoothstep((time - 3.15) / 0.9)
  if (fade <= 0.001) return []
  const [positive] = chargePositions(time)
  const items = []
  const seedRadius = FIELD_RADIUS + 0.085
  for (let seed = 0; seed < 24; seed++) {
    const angle = 2 * Math.PI * seed / 24
    let x = positive[0] + Math.cos(angle) * seedRadius
    let y = positive[1] + Math.sin(angle) * seedRadius
    for (let step = 0; step < 150; step++) {
      const [ex, ey] = electricField(x, y, time)
      const mag = Math.hypot(ex, ey)
      if (mag < 1e-8) break
      const nx = ex / mag
      const ny = ey / mag
      const x2 = x + nx * 0.055
      const y2 = y + ny * 0.055
      items.push([x, y, x2, y2, `rgba(86,220,232,${(0.72 * fade).toFixed(4)})`, 0.02])
      x = x2
      y = y2
      if (Math.abs(x) > 5.4 || Math.abs(y) > 2.7) break
      if (chargePositions(time).some(([cx, cy]) => Math.hypot(x - cx, y - cy) < FIELD_RADIUS * 0.88)) break
    }
  }
  return items
}

export async function electricFieldScene(canvas) {
  const scene = await makeScene(canvas, { unitSize: 110 })
  const grid = []
  for (let x = -5.4; x <= 5.401; x += 0.6) grid.push([x, -2.7, x, 2.7, 'rgba(92,105,130,.16)', 0.008])
  for (let y = -2.7; y <= 2.701; y += 0.6) grid.push([-5.4, y, 5.4, y, 'rgba(92,105,130,.16)', 0.008])

  const vectors = new DynamicLineSet(fieldVectorItems, { worldStroke: true, zIndex: 2 })
  const lines = new DynamicLineSet(streamlineItems, { worldStroke: true, zIndex: 3 })
  const charges = new DynamicCircleSet((time) => {
    const [positive, negative] = chargePositions(time)
    const show = smoothstep((time - 0.45) / 0.8)
    return [
      [positive[0], positive[1], FIELD_RADIUS, `rgba(235,79,96,${show})`, `rgba(255,255,255,${0.9 * show})`, .025],
      [negative[0], negative[1], FIELD_RADIUS, `rgba(72,135,255,${show})`, `rgba(255,255,255,${0.9 * show})`, .025],
    ]
  }, { zIndex: 6 })

  const symbols = new DynamicTextSet((time) => {
    const [positive, negative] = chargePositions(time)
    return [
      [positive[0], positive[1], '+', '#ffffff', 24, 700],
      [negative[0], negative[1], '−', '#ffffff', 24, 700],
    ]
  }, { zIndex: 7 })

  const title = new DynamicTextSet((time) => [[
    0,
    2.96,
    time < 3.55 ? 'Moving electric field · sampled vectors' : 'Moving electric field · field lines',
    '#ffffff',
    27,
    600,
  ]], { zIndex: 10 })

  scene.add(new LineSet(grid, { worldStroke: true, zIndex: -2 }), vectors, lines, charges, symbols, title)
  scene.wait(6.35)
  return scene
}

// -----------------------------------------------------------------------------
// Batched neural network pulse
// -----------------------------------------------------------------------------

function neuralLayerPoints(x, count) {
  const step = 5.4 / Math.max(1, count - 1)
  return Array.from({ length: count }, (_, i) => [x, 2.7 - i * step])
}

function pseudo(i, j) {
  const value = Math.sin(i * 91.17 + j * 17.31 + 12.77) * 43758.5453
  return value - Math.floor(value)
}

export async function neuralNetworkScene(canvas) {
  const scene = await makeScene(canvas, { unitSize: 82 })
  const counts = [6, 9, 7, 4]
  const xs = [-5.4, -1.8, 1.8, 5.2]
  const layers = counts.map((count, i) => neuralLayerPoints(xs[i], count))
  const edgeObjects = []
  const nodeObjects = []

  for (let layer = 0; layer < layers.length - 1; layer++) {
    const idle = []
    const active = []
    let edgeIndex = 0
    for (const a of layers[layer]) {
      for (const b of layers[layer + 1]) {
        const weight = pseudo(layer * 37 + edgeIndex, edgeIndex) * 2 - 1
        const color = weight >= 0 ? 'rgba(83,170,255,.52)' : 'rgba(255,106,129,.52)'
        idle.push([a[0], a[1], b[0], b[1], 'rgba(120,145,190,0)', .004])
        active.push([a[0], a[1], b[0], b[1], color, .004 + .006 * Math.abs(weight)])
        edgeIndex++
      }
    }
    const object = new LineSet(idle, { worldStroke: true, zIndex: 0 })
    edgeObjects.push([object, active])
  }

  for (let layer = 0; layer < layers.length; layer++) {
    const idle = layers[layer].map(([x, y]) => [x, y, .14, 'rgba(90,150,245,.18)', null, 0])
    const active = layers[layer].map(([x, y], i) => {
      const value = .18 + .82 * pseudo(layer * 11 + i, 4)
      return [x, y, .13 + .10 * value, `rgba(${80 + layer * 35},150,${255 - layer * 35},${.28 + .72 * value})`, 'rgba(230,238,255,.7)', .018]
    })
    nodeObjects.push([new CircleSet(idle, { zIndex: 2 }), active])
  }

  scene.add(new DynamicTextSet(() => [[0, 3.55, 'Signals flow; geometry stays batched', '#ffffff', 28, 600]], { zIndex: 10 }))
  for (const [object] of edgeObjects) scene.add(object)
  for (const [object] of nodeObjects) scene.add(object)

  scene.wait(.25)
  for (let i = 0; i < edgeObjects.length; i++) {
    scene.parallel(.75, (api) => {
      api.batch(nodeObjects[i][0], { to: nodeObjects[i][1], duration: .55 })
      api.batch(edgeObjects[i][0], { to: edgeObjects[i][1], duration: .75, at: .2 })
      api.batch(nodeObjects[i + 1][0], { to: nodeObjects[i + 1][1], duration: .55, at: .55 })
    })
    scene.wait(.12)
  }

  const output = nodeObjects.at(-1)
  const winner = output[1].map((item, index) => [
    item[0],
    item[1],
    index === 2 ? .31 : .16,
    index === 2 ? 'rgba(255,158,82,1)' : 'rgba(255,158,82,.28)',
    'rgba(255,240,210,.9)',
    .026,
  ])
  scene.batch(output[0], { to: winner, duration: .55 })
  scene.wait(.65)
  return scene
}

// -----------------------------------------------------------------------------
// Recorded elastic-collision simulation
// -----------------------------------------------------------------------------

export async function collisionScene(canvas) {
  const data = (await generatedData()).collisions
  const scene = await makeScene(canvas, { unitSize: 100 })
  const palette = [BLUE, GREEN, RED, YELLOW, ORANGE, PURPLE, '#ff72b6', '#53d8e8', WHITE]
  const balls = new DynamicCircleSet((time) => {
    const index = Math.max(0, Math.min(data.frames.length - 1, Math.round(time * data.fps)))
    return data.frames[index].map(([x, y], i) => [x, y, .22, palette[i % palette.length], 'rgba(235,238,245,.92)', .018])
  }, { zIndex: 2 })
  scene.add(new Square(6.3, { fill: '#12161f', stroke: '#697489', strokeWidth: .045 }), balls)
  scene.wait(data.duration)
  return scene
}

// -----------------------------------------------------------------------------
// Sorting traces generated from the Python algorithms
// -----------------------------------------------------------------------------

function sortingSchedule(data) {
  let cursor = 0
  const sections = []
  for (const trace of data.traces) {
    const start = cursor
    cursor += .29
    const steps = []
    for (const step of trace.steps) {
      const duration = step.kind === 'move' ? .06 : .065
      steps.push({ start: cursor, end: cursor + duration, step })
      cursor += duration
    }
    cursor += .315
    sections.push({ trace, start, end: cursor, steps })
  }
  return { sections, duration: cursor + .125 }
}

function sortStateAt(schedule, time) {
  let section = schedule.sections.find((item) => time >= item.start && time < item.end)
  if (!section) section = time < schedule.sections[0].start ? schedule.sections[0] : schedule.sections.at(-1)
  let step = section.steps.find((item) => time >= item.start && time < item.end)?.step
  if (!step) step = time < section.steps[0].start ? section.steps[0].step : section.steps.at(-1).step
  return { section, step }
}

function sortingBars(step, n) {
  const position = new Map(step.values.map((value, index) => [value, index]))
  const spacing = 10.2 / Math.max(1, n - 1)
  const heightScale = 5.65 / n
  const x0 = -5.1
  const active = new Set(step.active)
  const settled = new Set(step.settled)
  const items = []
  for (let value = 1; value <= n; value++) {
    const x = x0 + position.get(value) * spacing
    let color = BLUE
    if (value === step.pivot) color = '#ff72b6'
    else if (active.has(value)) color = step.kind === 'move' ? ORANGE : YELLOW
    else if (settled.has(value)) color = GREEN
    items.push([x, -3.05, x, -3.05 + value * heightScale, color, .11])
  }
  return items
}

export async function sortingScene(canvas) {
  const data = (await generatedData()).sorting
  const schedule = sortingSchedule(data)
  const scene = await makeScene(canvas, { unitSize: 100 })
  const bars = new DynamicLineSet((time) => {
    const { step } = sortStateAt(schedule, time)
    return sortingBars(step, data.initial.length)
  }, { worldStroke: true, zIndex: 2 })
  const text = new DynamicTextSet((time) => {
    const { section } = sortStateAt(schedule, time)
    return [
      [0, 4.2, section.trace.name, '#ffffff', 30, 650],
      [0, 3.76, section.trace.subtitle, '#8791a4', 16, 500],
      [0, -4.25, 'yellow compare · orange move · pink pivot · green settled', '#8791a4', 14, 500],
    ]
  }, { zIndex: 5 })
  scene.add(
    new LineSet([[-5.4, -3.05, 5.4, -3.05, 'rgba(103,114,138,.42)', .018]], { worldStroke: true }),
    bars,
    text,
  )
  scene.wait(schedule.duration)
  return scene
}

// -----------------------------------------------------------------------------
// Red-black tree trace generated from the Python CLRS implementation
// -----------------------------------------------------------------------------

function treePositionMap(nodes, values) {
  const sorted = [...values].sort((a, b) => a - b)
  const ranks = new Map(sorted.map((value, index) => [value, index]))
  const states = new Map(nodes.map((node) => [node.value, node]))
  const denominator = Math.max(1, values.length - 1)
  const map = new Map()
  for (const value of values) {
    const state = states.get(value)
    map.set(value, [
      -5.1 + 10.2 * ranks.get(value) / denominator,
      state ? 2.55 - state.depth * 1.18 : -4.15,
    ])
  }
  return map
}

function treeSchedule(data) {
  let cursor = .22
  const segments = []
  let previous = { kind: 'empty', message: '', active: [], nodes: [] }
  for (const step of data.steps) {
    cursor += .12
    const duration = step.kind === 'insert' ? .58 : step.kind.startsWith('rotate') ? .72 : .48
    segments.push({ start: cursor, end: cursor + duration, previous, step })
    cursor += duration + (step.kind === 'insert' ? .2 : .12)
    previous = step
  }
  return { segments, duration: cursor + 1.09 }
}

function treeStateAt(schedule, time) {
  let segment = schedule.segments.find((item) => time >= item.start && time <= item.end)
  if (!segment) {
    const past = schedule.segments.filter((item) => item.end < time)
    segment = past.length ? { ...past.at(-1), start: time, end: time, previous: past.at(-1).step, step: past.at(-1).step } : schedule.segments[0]
  }
  const alpha = segment.end <= segment.start ? 1 : smoothstep((time - segment.start) / (segment.end - segment.start))
  return { ...segment, alpha }
}

export async function redBlackTreeScene(canvas) {
  const data = (await generatedData()).redBlack
  const schedule = treeSchedule(data)
  const scene = await makeScene(canvas, { unitSize: 100 })

  const nodes = new DynamicCircleSet((time) => {
    const state = treeStateAt(schedule, time)
    const a = treePositionMap(state.previous.nodes, data.values)
    const b = treePositionMap(state.step.nodes, data.values)
    const target = new Map(state.step.nodes.map((node) => [node.value, node]))
    const active = new Set(state.step.active)
    return [...data.values].sort((x, y) => x - y).map((value) => {
      const pa = a.get(value)
      const pb = b.get(value)
      const exists = target.has(value)
      const node = target.get(value)
      return [
        lerp(pa[0], pb[0], state.alpha),
        lerp(pa[1], pb[1], state.alpha),
        .34,
        exists ? (node.red ? '#e64f60' : '#161a22') : 'rgba(22,26,34,0)',
        exists ? (active.has(value) ? '#ffe16b' : 'rgba(188,198,220,.82)') : 'rgba(188,198,220,0)',
        active.has(value) ? .055 : .03,
      ]
    })
  }, { zIndex: 2 })

  const edges = new DynamicLineSet((time) => {
    const state = treeStateAt(schedule, time)
    const a = treePositionMap(state.previous.nodes, data.values)
    const b = treePositionMap(state.step.nodes, data.values)
    const target = new Map(state.step.nodes.map((node) => [node.value, node]))
    const items = []
    for (const value of data.values) {
      const node = target.get(value)
      if (!node || node.parent == null) continue
      const p = [
        lerp(a.get(node.parent)[0], b.get(node.parent)[0], state.alpha),
        lerp(a.get(node.parent)[1], b.get(node.parent)[1], state.alpha),
      ]
      const c = [
        lerp(a.get(value)[0], b.get(value)[0], state.alpha),
        lerp(a.get(value)[1], b.get(value)[1], state.alpha),
      ]
      items.push([p[0], p[1], c[0], c[1], 'rgba(135,148,174,.72)', .025])
    }
    return items
  }, { worldStroke: true, zIndex: 0 })

  const labels = new DynamicTextSet((time) => {
    const state = treeStateAt(schedule, time)
    const a = treePositionMap(state.previous.nodes, data.values)
    const b = treePositionMap(state.step.nodes, data.values)
    const visible = new Set(state.step.nodes.map((node) => node.value))
    return data.values.filter((value) => visible.has(value)).map((value) => [
      lerp(a.get(value)[0], b.get(value)[0], state.alpha),
      lerp(a.get(value)[1], b.get(value)[1], state.alpha),
      String(value),
      '#ffffff',
      16,
      600,
    ])
  }, { zIndex: 4 })

  const status = new DynamicTextSet((time) => {
    const { step } = treeStateAt(schedule, time)
    return [
      [0, 4.35, 'Random red-black tree insertion', '#ffffff', 30, 650],
      [0, 3.9, 'sequence  ' + data.values.join('  '), '#8994a7', 15, 500],
      [0, 3.43, step.message || 'seed 19 · 12 unique keys', step.kind === 'recolor' ? '#ffe16b' : step.kind.startsWith('rotate') ? '#6ecfff' : '#cbd3e0', 17, 500],
    ]
  }, { zIndex: 7 })

  scene.add(edges, nodes, labels, status)
  scene.wait(schedule.duration)
  return scene
}
