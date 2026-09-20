<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  Arrow,
  Circle,
  InfiniteGrid,
  InfiniteLine,
  Polygon,
  Scene,
  Text,
  Transform2D,
} from '@zanim/web'

const canvas = ref(null)
const ready = ref(false)
const renderMs = ref(0)
const dragging = ref('')

const matrix = reactive({ xx: 1, xy: 0, yx: 0, yy: 1 })
const view = reactive({ x: 0, y: 0, zoom: 1 })
const options = reactive({ original: true, shape: true })

let scene = null
let transformedGrid = null
let transformedX = null
let transformedY = null
let transformedSquare = null
let originalShape = null
let transformedShape = null
let handleX = null
let handleY = null
let labelX = null
let labelY = null
let basisArrowX = null
let basisArrowY = null
let pointerState = null
let animationFrame = 0

const determinant = computed(() => matrix.xx * matrix.yy - matrix.xy * matrix.yx)
const trace = computed(() => matrix.xx + matrix.yy)
const stateLabel = computed(() => {
  const d = determinant.value
  if (Math.abs(d) < 0.015) return 'singular / rank-deficient'
  return d > 0 ? 'orientation preserving' : 'orientation reversing'
})
const areaLabel = computed(() => Math.abs(determinant.value).toFixed(3))

const presets = [
  ['Identity', { xx: 1, xy: 0, yx: 0, yy: 1 }],
  ['Rotate 55°', (() => { const a = 55 * Math.PI / 180; return { xx: Math.cos(a), xy: -Math.sin(a), yx: Math.sin(a), yy: Math.cos(a) } })()],
  ['Scale', { xx: 1.8, xy: 0, yx: 0, yy: 0.55 }],
  ['Shear', { xx: 1, xy: 1.15, yx: 0, yy: 1 }],
  ['Reflect', { xx: -1, xy: 0, yx: 0, yy: 1 }],
  ['Project', { xx: 1, xy: 0.65, yx: 0, yy: 0 }],
  ['General', { xx: 1.15, xy: 0.75, yx: -0.45, yy: 1.05 }],
]

function rgba(hex, alpha) {
  const a = Math.max(0, Math.min(255, Math.round(alpha))).toString(16).padStart(2, '0')
  return `${hex}${a}`
}

function matrixTransform() {
  return new Transform2D(matrix.xx, matrix.xy, matrix.yx, matrix.yy, 0, 0)
}

function cameraTransform() {
  return Transform2D.translation(view.x, view.y).mul(Transform2D.scaling(view.zoom))
}

function render() {
  if (!scene) return
  scene.render()
  renderMs.value = scene.stats.renderMs
}

function setRetainedState(object, patch) {
  if (!scene || !object) return
  const base = scene.initial.get(object.id) ?? scene.authoredState(object)
  const next = { ...base, ...patch }
  if (patch.style) next.style = { ...(base.style ?? {}), ...patch.style }
  scene.initial.set(object.id, next)
  scene.authored.set(object.id, { ...next })
}

function setRetainedTransform(object, transform) {
  setRetainedState(object, { transform })
}

function setRetainedOpacity(object, opacity) {
  setRetainedState(object, { opacity })
}

function updateHandles() {
  if (!handleX) return
  const invZoom = 1 / view.zoom
  setRetainedTransform(handleX, Transform2D.translation(matrix.xx, matrix.yx).mul(Transform2D.scaling(invZoom)))
  setRetainedTransform(handleY, Transform2D.translation(matrix.xy, matrix.yy).mul(Transform2D.scaling(invZoom)))
  setRetainedTransform(labelX, Transform2D.translation(matrix.xx + 0.18 / view.zoom, matrix.yx + 0.23 / view.zoom))
  setRetainedTransform(labelY, Transform2D.translation(matrix.xy + 0.18 / view.zoom, matrix.yy + 0.23 / view.zoom))
}

function applyMatrix() {
  if (!scene) return
  const t = matrixTransform()
  for (const object of [transformedGrid, transformedX, transformedY, basisArrowX, basisArrowY, transformedSquare, transformedShape]) {
    setRetainedTransform(object, t)
  }
  setRetainedOpacity(transformedGrid, 1)
  setRetainedState(transformedSquare, {
    style: {
      fill: determinant.value < 0 ? 'rgba(255,151,92,.20)' : 'rgba(96,166,255,.18)',
      stroke: Math.abs(determinant.value) < 0.015 ? '#ffd669' : (determinant.value < 0 ? '#ff975c' : '#72d7ff'),
    },
  })
  setRetainedOpacity(originalShape, options.original && options.shape ? 0.24 : 0)
  setRetainedOpacity(transformedShape, options.shape ? 1 : 0)
  updateHandles()
  render()
}

function applyView() {
  if (!scene) return
  setRetainedTransform(scene.camera, cameraTransform())
  updateHandles()
  render()
}

function resetMatrix() {
  animateTo({ xx: 1, xy: 0, yx: 0, yy: 1 })
}

function resetView() {
  view.x = 0
  view.y = 0
  view.zoom = 1
  applyView()
}

function animateTo(target) {
  cancelAnimationFrame(animationFrame)
  const start = { ...matrix }
  const t0 = performance.now()
  const duration = 360
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / duration)
    const u = p * p * (3 - 2 * p)
    matrix.xx = start.xx + (target.xx - start.xx) * u
    matrix.xy = start.xy + (target.xy - start.xy) * u
    matrix.yx = start.yx + (target.yx - start.yx) * u
    matrix.yy = start.yy + (target.yy - start.yy) * u
    applyMatrix()
    if (p < 1) animationFrame = requestAnimationFrame(tick)
  }
  animationFrame = requestAnimationFrame(tick)
}

function cameraPoint(event) {
  const rect = canvas.value.getBoundingClientRect()
  const dpr = scene.renderer.dpr
  const px = (event.clientX - rect.left) * dpr
  const py = (event.clientY - rect.top) * dpr
  return [
    (px - scene.renderer.canvas.width / 2) / scene.renderer.unitSize,
    -(py - scene.renderer.canvas.height / 2) / scene.renderer.unitSize,
  ]
}

function worldPoint(event) {
  const p = cameraPoint(event)
  return scene.camera.transform.inverse().apply(p[0], p[1])
}

function screenPoint(world) {
  const rect = canvas.value.getBoundingClientRect()
  const p = scene.camera.transform.apply(world[0], world[1])
  const cssUnit = scene.renderer.unitSize / scene.renderer.dpr
  return [rect.width / 2 + p[0] * cssUnit, rect.height / 2 - p[1] * cssUnit]
}

function hitHandle(event) {
  const rect = canvas.value.getBoundingClientRect()
  const pointer = [event.clientX - rect.left, event.clientY - rect.top]
  const a = screenPoint([matrix.xx, matrix.yx])
  const b = screenPoint([matrix.xy, matrix.yy])
  const da = Math.hypot(pointer[0] - a[0], pointer[1] - a[1])
  const db = Math.hypot(pointer[0] - b[0], pointer[1] - b[1])
  if (Math.min(da, db) > 18) return ''
  return da <= db ? 'basis-x' : 'basis-y'
}

function onPointerDown(event) {
  if (!scene) return
  cancelAnimationFrame(animationFrame)
  const handle = hitHandle(event)
  dragging.value = handle || 'pan'
  pointerState = { id: event.pointerId, x: event.clientX, y: event.clientY }
  canvas.value.setPointerCapture(event.pointerId)
  canvas.value.style.cursor = handle ? 'grabbing' : 'grabbing'
  event.preventDefault()
}

function onPointerMove(event) {
  if (!scene) return
  if (!pointerState) {
    canvas.value.style.cursor = hitHandle(event) ? 'pointer' : 'grab'
    return
  }
  if (pointerState.id !== event.pointerId) return

  if (dragging.value === 'pan') {
    const cssUnit = scene.renderer.unitSize / scene.renderer.dpr
    view.x += (event.clientX - pointerState.x) / cssUnit
    view.y -= (event.clientY - pointerState.y) / cssUnit
    pointerState.x = event.clientX
    pointerState.y = event.clientY
    applyView()
  } else {
    let [x, y] = worldPoint(event)
    if (event.shiftKey) {
      x = Math.round(x * 4) / 4
      y = Math.round(y * 4) / 4
    }
    x = Math.max(-6, Math.min(6, x))
    y = Math.max(-6, Math.min(6, y))
    if (dragging.value === 'basis-x') {
      matrix.xx = x
      matrix.yx = y
    } else {
      matrix.xy = x
      matrix.yy = y
    }
    applyMatrix()
  }
  event.preventDefault()
}

function endPointer(event) {
  if (!pointerState || pointerState.id !== event.pointerId) return
  pointerState = null
  dragging.value = ''
  if (canvas.value.hasPointerCapture?.(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
  canvas.value.style.cursor = hitHandle(event) ? 'pointer' : 'grab'
}

function onWheel(event) {
  if (!scene) return
  const before = worldPoint(event)
  const camera = cameraPoint(event)
  const next = Math.max(0.28, Math.min(4.5, view.zoom * Math.exp(-event.deltaY * 0.0012)))
  view.zoom = next
  view.x = camera[0] - next * before[0]
  view.y = camera[1] - next * before[1]
  applyView()
  event.preventDefault()
}

function toggleOriginal() {
  const originalObjects = scene.objects.filter((object) => object.__originalReference)
  for (const object of originalObjects) setRetainedOpacity(object, options.original ? object.__baseOpacity : 0)
  applyMatrix()
}

onMounted(async () => {
  const rect = canvas.value.getBoundingClientRect()
  const scale = Math.max(0.2, rect.width / 1280)
  scene = await Scene.create(canvas.value, {
    renderer: { unitSize: 100 * scale, background: '#080b12' },
    fps: 60,
  })

  const originalGrid = new InfiniteGrid({ step: 0.5, stroke: 'rgba(92,107,138,.24)', strokeWidth: 0.011, zIndex: -8 })
  originalGrid.__originalReference = true
  originalGrid.__baseOpacity = 1
  const originalX = new InfiniteLine([0, 0], [1, 0], { stroke: 'rgba(245,92,105,.23)', strokeWidth: 0.018, zIndex: -7 })
  const originalY = new InfiniteLine([0, 0], [0, 1], { stroke: 'rgba(82,205,150,.23)', strokeWidth: 0.018, zIndex: -7 })
  for (const item of [originalX, originalY]) { item.__originalReference = true; item.__baseOpacity = 1 }

  transformedGrid = new InfiniteGrid({ step: 0.5, stroke: 'rgba(96,166,255,.48)', strokeWidth: 0.014, zIndex: -5 })
  transformedX = new InfiniteLine([0, 0], [1, 0], { stroke: rgba('#f55c69', 235), strokeWidth: 0.037, zIndex: -3 })
  transformedY = new InfiniteLine([0, 0], [0, 1], { stroke: rgba('#52cd96', 235), strokeWidth: 0.037, zIndex: -3 })

  const baseSquare = [[0, 0], [1, 0], [1, 1], [0, 1]]
  transformedSquare = new Polygon(baseSquare, { fill: 'rgba(96,166,255,.18)', stroke: '#72d7ff', strokeWidth: 0.035, zIndex: 1 })

  const lShape = [[0.45,0.35],[2.05,0.35],[2.05,0.85],[1.2,0.85],[1.2,1.75],[0.45,1.75]]
  originalShape = new Polygon(lShape, { fill: 'rgba(96,166,255,.05)', stroke: 'rgba(114,215,255,.46)', strokeWidth: 0.025, opacity: 0.24, zIndex: 2 })
  originalShape.__originalReference = true
  originalShape.__baseOpacity = 0.24
  transformedShape = new Polygon(lShape, { fill: 'rgba(96,166,255,.38)', stroke: '#72d7ff', strokeWidth: 0.04, zIndex: 3 })

  basisArrowX = new Arrow([0, 0], [1, 0], { stroke: '#f55c69', width: 4, zIndex: 5 })
  basisArrowY = new Arrow([0, 0], [0, 1], { stroke: '#52cd96', width: 4, zIndex: 5 })

  handleX = new Circle(0.105, { fill: '#f55c69', stroke: '#fff2f4', strokeWidth: 0.025, zIndex: 12 })
  handleY = new Circle(0.105, { fill: '#52cd96', stroke: '#effff7', strokeWidth: 0.025, zIndex: 12 })
  labelX = new Text('A e₁', { fontSize: 16, color: '#ff9ca6', zIndex: 13 })
  labelY = new Text('A e₂', { fontSize: 16, color: '#83e6b3', zIndex: 13 })

  scene.add(
    originalGrid, originalX, originalY,
    transformedGrid, transformedX, transformedY,
    transformedSquare, originalShape, transformedShape,
    basisArrowX, basisArrowY, handleX, handleY, labelX, labelY,
    new Circle(0.045, { fill: '#ffd669', stroke: null, zIndex: 14 }),
  )

  canvas.value.addEventListener('wheel', onWheel, { passive: false })
  applyView()
  applyMatrix()
  ready.value = true
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  canvas.value?.removeEventListener('wheel', onWheel)
  scene?.destroy()
  scene = null
})
</script>

<template>
  <section class="lab-card">
    <div class="lab-canvas-wrap">
      <canvas
        ref="canvas"
        class="lab-canvas"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endPointer"
        @pointercancel="endPointer"
      ></canvas>
      <div class="canvas-help">
        <strong>Drag basis handles</strong>
        <span>background → pan · wheel → zoom · Shift → snap 0.25</span>
      </div>
      <div class="canvas-status">
        <span>{{ view.zoom.toFixed(2) }}×</span>
        <span>pan {{ view.x.toFixed(2) }}, {{ view.y.toFixed(2) }}</span>
        <span>{{ renderMs.toFixed(2) }} ms render</span>
      </div>
      <div v-if="!ready" class="lab-loading">loading Web runtime…</div>
    </div>

    <aside class="lab-panel">
      <div class="lab-section matrix-section">
        <div class="section-heading">
          <span>Matrix A</span>
          <button @click="resetMatrix">Reset</button>
        </div>
        <div class="matrix-editor">
          <span class="bracket left">[</span>
          <div class="matrix-cells">
            <input v-model.number="matrix.xx" type="number" step="0.05" @input="applyMatrix" />
            <input v-model.number="matrix.xy" type="number" step="0.05" @input="applyMatrix" />
            <input v-model.number="matrix.yx" type="number" step="0.05" @input="applyMatrix" />
            <input v-model.number="matrix.yy" type="number" step="0.05" @input="applyMatrix" />
          </div>
          <span class="bracket right">]</span>
        </div>
      </div>

      <div class="metrics">
        <div><span>det A</span><strong :class="{ negative: determinant < 0, singular: Math.abs(determinant) < .015 }">{{ determinant.toFixed(3) }}</strong></div>
        <div><span>|area scale|</span><strong>{{ areaLabel }}</strong></div>
        <div><span>trace A</span><strong>{{ trace.toFixed(3) }}</strong></div>
        <div class="wide"><span>map</span><strong>{{ stateLabel }}</strong></div>
      </div>

      <div class="lab-section">
        <div class="section-heading"><span>Presets</span></div>
        <div class="preset-grid">
          <button v-for="([name, value]) in presets" :key="name" @click="animateTo(value)">{{ name }}</button>
        </div>
      </div>

      <div class="lab-section">
        <div class="section-heading">
          <span>View</span>
          <button @click="resetView">Reset view</button>
        </div>
        <label class="toggle-row"><input v-model="options.original" type="checkbox" @change="toggleOriginal" /><span>Original grid + axes</span></label>
        <label class="toggle-row"><input v-model="options.shape" type="checkbox" @change="applyMatrix" /><span>Reference L-shape</span></label>
      </div>

      <div class="basis-readout">
        <div><i class="red"></i><span>A e₁</span><strong>({{ matrix.xx.toFixed(2) }}, {{ matrix.yx.toFixed(2) }})</strong></div>
        <div><i class="green"></i><span>A e₂</span><strong>({{ matrix.xy.toFixed(2) }}, {{ matrix.yy.toFixed(2) }})</strong></div>
      </div>
    </aside>
  </section>

  <section class="lab-info">
    <article><span>Interaction model</span><strong>Pointer → retained Scene state</strong><p>No authored timeline is involved. Pointer and wheel events mutate transforms/camera state and call <code>scene.render()</code> immediately.</p></article>
    <article><span>Infinite geometry</span><strong>WASM grid resolution</strong><p>The transformed infinite grid is still clipped/resolved by Zanim's shared WebAssembly kernel while the matrix changes continuously.</p></article>
    <article><span>Direct manipulation</span><strong>Columns of A are draggable</strong><p>The red and green endpoints are A e₁ and A e₂. Dragging them edits the matrix itself, including reflections and singular maps.</p></article>
    <article><span>Viewport</span><strong>Pan + cursor-centered zoom</strong><p>Camera state is independent from A, so changing the view never changes the linear map being studied.</p></article>
  </section>
</template>

<style scoped>
.lab-card { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: minmax(0,1fr) 300px; overflow: hidden; border: 1px solid rgba(151,174,216,.14); border-radius: 19px; background: #0c111b; box-shadow: 0 28px 80px rgba(0,0,0,.34); }
.lab-canvas-wrap { position: relative; min-width: 0; aspect-ratio: 16 / 9; background: #080b12; overflow: hidden; }
.lab-canvas { width: 100%; height: 100%; display: block; cursor: grab; touch-action: none; user-select: none; }
.canvas-help { position: absolute; left: 15px; bottom: 14px; pointer-events: none; display: grid; gap: 3px; padding: 8px 10px; border: 1px solid rgba(150,170,210,.13); border-radius: 10px; background: rgba(7,10,17,.72); backdrop-filter: blur(10px); }
.canvas-help strong { font-size: 10px; font-weight: 650; color: #cbd7ec; }
.canvas-help span { color: #71809a; font-size: 9px; }
.canvas-status { position: absolute; top: 13px; right: 13px; pointer-events: none; display: flex; gap: 6px; }
.canvas-status span { padding: 5px 7px; border: 1px solid rgba(150,170,210,.12); border-radius: 7px; background: rgba(7,10,17,.68); color: #8190aa; font: 9px ui-monospace, SFMono-Regular, monospace; }
.lab-loading { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(8,11,18,.76); color: #8190aa; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.lab-panel { border-left: 1px solid rgba(151,174,216,.11); background: rgba(10,14,23,.97); padding: 15px; display: flex; flex-direction: column; gap: 13px; }
.lab-section { padding: 12px; border: 1px solid rgba(151,174,216,.10); border-radius: 12px; background: rgba(255,255,255,.018); }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.section-heading > span { color: #8291aa; font-size: 9px; text-transform: uppercase; letter-spacing: .12em; }
.section-heading button { border: 0; padding: 3px 0; background: transparent; color: #6f9ee7; font-size: 9px; cursor: pointer; }
.matrix-editor { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 5px; }
.matrix-cells { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.matrix-cells input { min-width: 0; width: 100%; border: 1px solid rgba(145,170,215,.15); border-radius: 8px; padding: 7px 4px; background: #0a0f19; color: #dce6f8; text-align: center; font: 12px ui-monospace, SFMono-Regular, monospace; outline: none; }
.matrix-cells input:focus { border-color: rgba(96,166,255,.7); box-shadow: 0 0 0 2px rgba(96,166,255,.08); }
.bracket { color: #71809a; font: 39px/1 ui-monospace, monospace; transform: scaleY(1.38); }
.metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.metrics > div { padding: 9px 10px; border-radius: 10px; background: rgba(255,255,255,.025); }
.metrics .wide { grid-column: 1 / -1; }
.metrics span { display: block; color: #6f7e98; font-size: 8px; text-transform: uppercase; letter-spacing: .08em; }
.metrics strong { display: block; margin-top: 4px; color: #d9e4f7; font: 12px ui-monospace, SFMono-Regular, monospace; }
.metrics strong.negative { color: #ffad7e; }
.metrics strong.singular { color: #ffd669; }
.preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.preset-grid button { border: 1px solid rgba(145,170,215,.12); border-radius: 8px; padding: 7px 4px; background: #111827; color: #99a8c1; font-size: 9px; cursor: pointer; }
.preset-grid button:hover { border-color: rgba(96,166,255,.4); color: #dce8fb; }
.toggle-row { display: flex; align-items: center; gap: 8px; margin: 7px 0 0; color: #94a2ba; font-size: 10px; cursor: pointer; }
.toggle-row input { accent-color: #60a6ff; }
.basis-readout { margin-top: auto; display: grid; gap: 6px; }
.basis-readout > div { display: grid; grid-template-columns: 8px 40px 1fr; align-items: center; gap: 6px; color: #8e9cb4; font-size: 9px; }
.basis-readout i { width: 7px; height: 7px; border-radius: 50%; }
.basis-readout i.red { background: #f55c69; }
.basis-readout i.green { background: #52cd96; }
.basis-readout strong { text-align: right; color: #cdd8eb; font: 9px ui-monospace, monospace; }
.lab-info { max-width: 1320px; margin: 18px auto 0; display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }
.lab-info article { min-height: 124px; padding: 15px 16px; border: 1px solid rgba(151,174,216,.11); border-radius: 14px; background: rgba(12,17,27,.66); }
.lab-info span { color: #667691; font-size: 9px; text-transform: uppercase; letter-spacing: .12em; }
.lab-info strong { display: block; margin-top: 7px; font-size: 12px; font-weight: 620; }
.lab-info p { margin: 8px 0 0; color: #7c899f; font-size: 10px; line-height: 1.6; }
.lab-info code { color: #9abef8; font-size: 9px; }
@media (max-width: 1050px) { .lab-card { grid-template-columns: 1fr; } .lab-panel { border-left: 0; border-top: 1px solid rgba(151,174,216,.11); display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); } .basis-readout { margin-top: 0; } .lab-info { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media (max-width: 760px) { .lab-panel { grid-template-columns: 1fr; } .lab-info { grid-template-columns: 1fr; } .canvas-help span { display: none; } .canvas-status { top: 8px; right: 8px; } }
</style>
