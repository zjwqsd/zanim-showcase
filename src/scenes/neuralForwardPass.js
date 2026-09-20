import {
  Circle,
  DynamicCircleSet,
  DynamicLineSet,
  DynamicVectorObject2D,
  Group,
  LineSet,
  Scene,
  Text,
  TextSet,
  Transform2D,
  Typst,
  prepareVectorMorph,
} from '@zanim/web'

const BG = '#080b10'
const BLUE = '#58b9f2'
const GOLD = '#ffd166'
const MUTED = '#697887'
const WHITE = '#ffffff'
const W1 = [[1.15, 0.75], [-0.35, 1.10]]
const B1 = [0.15, -0.10]
const W2 = [[1.10, -0.65], [-0.75, 1.20]]
const B2 = [-0.15, 0.10]
const SAMPLE = [1.25, 0.60]
const SCALE = 1.4

const T_INPUT_END = 1.0
const T_AFFINE_END = 2.6
const T_TANH_END = 4.2
const T_LAYOUT_END = 5.4
const T_INPUT_HIGHLIGHT_END = 5.9
const T_HIDDEN_PULSE_END = 6.8
const T_HIDDEN_HIGHLIGHT_END = 7.3
const T_OUTPUT_PULSE_END = 8.2
const T_OUTPUT_HIGHLIGHT_END = 8.8

const POINTS = [[-1.1541675025487623,-0.19443404599370817],[-0.7632199751697286,-0.688863919890881],[-0.700610941275442,-0.19797675129026415],[-0.6946378504542648,-0.1910327063710529],[-0.5468168310430785,-0.6751025515067488],[-0.30732110381108013,0.180955937654115],[-1.2339835608982306,-0.03593347477585751],[-0.8265407200498556,-0.9983054262469002],[-0.7678656642059913,-0.5341596483621154],[-1.0975052780982024,-0.5409545756444145],[-1.1669527626379905,-0.2713061192950044],[-0.9622795416180824,-0.9236607365569118],[-1.1047953531232635,-0.8379244589631192],[-1.495603365033051,-0.43878144029233557],[-0.6664328924080051,-0.04765739838679889],[-1.2358166384921876,-0.5841683295993341],[-1.3226898598622512,-0.24290391229773609],[-0.6347064848759076,-0.2927800571846113],[-0.7298209988329447,-0.1738363781394607],[-0.41336759074546126,-1.1026762946224682],[-1.8311032924455195,-0.3793758311383846],[-0.751749587680357,-0.4642197127033656],[-0.8339455347980267,-0.7694179188271824],[-1.4911594613909696,-0.5866303547534186],[-0.6718841399117703,-0.021456652138359178],[-1.2781685577404445,-0.22755225202161045],[-1.2525526258399962,-0.2919760758010626],[-1.4345755884303995,-0.3186217390076059],[-1.2869440346425747,-0.3177438031428089],[-1.2542966163447697,-0.6286965921135701],[-0.9557617977301553,-0.4351181443301245],[-0.9915482414447522,-0.4676340726208148],[-0.7606402700247895,-0.6262739012198029],[-0.7001870924540667,0.23278972377793844],[-1.10486620553251,0.39809723069121267],[-0.20841770322232345,-0.1227699987938097],[0.4069579403522606,-0.26396370041207007],[0.8796885263212395,1.024853334063244],[1.1798199399863163,0.6380517493941407],[0.8496346760838207,0.06722418833559973],[1.0987684417479202,-0.07133591222272556],[0.8712222445369612,0.5442378722889952],[0.9643736613612465,0.549334407043276],[0.7716093618169589,0.5773083376073609],[1.1118601522803848,-0.2768883791509609],[0.5330948184757169,0.07507899876269136],[1.2122345256327938,0.46479046135426993],[1.0631953166982249,0.415714325155643],[1.2045905816105442,0.7092321799055249],[0.728113526184256,-0.25454662258295113],[1.2169297821811889,0.2704169033673912],[0.9695221506922562,0.2839539993355979],[0.5049726805076956,-0.22404749957773284],[1.33571207470969,0.7653751613336333],[1.3224958655004857,0.42912916538557344],[1.057408313628502,0.19080672420526812],[0.9772048940796764,0.19692228967259592],[0.732525534169566,0.42797720329333155],[1.6292401768187457,-0.36574575807694654],[1.1906045272956771,0.6067474786621531],[0.46423754249213317,0.46911097818722886],[0.9906299853294871,0.17368656575808672],[0.7514702753512819,-0.18434581149205875],[1.632871111342902,1.2420756550652243],[1.584550357547692,0.24063856352313268],[1.0642727924533468,0.4933390900157958],[0.6248268190397108,0.25176492335210693],[1.1632981634329171,0.18978328022032184],[0.2460975536681066,-0.13184708647279592],[1.0519953506360669,0.22191666932099485],[0.830682555278206,0.8652715895433613],[0.9839146491857212,0.07737423149737699]]

const COLUMNS = [-0.1, 2.55, 5.2]
const YS = [0.95, -0.95]
const NODE_POSITIONS = COLUMNS.flatMap(x => YS.map(y => [x, y]))
const clamp01 = value => globalThis.Math.max(0, globalThis.Math.min(1, Number(value)))
const smooth01 = value => { const p = clamp01(value); return p * p * (3 - 2 * p) }
const progress = (time, start, end, smooth = true) => {
  const p = end <= start ? (time >= end ? 1 : 0) : clamp01((time - start) / (end - start))
  return smooth ? smooth01(p) : p
}
const mix = (a, b, p) => a + (b - a) * p
const mix2 = (a, b, p) => [mix(a[0], b[0], p), mix(a[1], b[1], p)]
const coord = p => [SCALE * p[0], SCALE * p[1]]
const mul2 = (m, p) => [m[0][0] * p[0] + m[0][1] * p[1], m[1][0] * p[0] + m[1][1] * p[1]]
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]]
const affineXY = point => coord(add2(mul2(W1, [point[0] / SCALE, point[1] / SCALE]), B1))
const activateXY = point => coord([globalThis.Math.tanh(point[0] / SCALE), globalThis.Math.tanh(point[1] / SCALE)])
const rgba = (hex, alpha = 1) => {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16), g = parseInt(value.slice(2, 4), 16), b = parseInt(value.slice(4, 6), 16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + clamp01(alpha) + ')'
}
const parseHex = hex => {
  const value = hex.replace('#', '')
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16), 1]
}
const blend = (a, b, p) => 'rgba(' +
  globalThis.Math.round(mix(a[0], b[0], p)) + ',' +
  globalThis.Math.round(mix(a[1], b[1], p)) + ',' +
  globalThis.Math.round(mix(a[2], b[2], p)) + ',' +
  mix(a[3], b[3], p) + ')'

const transformPoint = (base, time) => {
  let out
  if (time < T_INPUT_END) out = base.slice()
  else if (time < T_AFFINE_END) out = mix2(base, affineXY(base), progress(time, T_INPUT_END, T_AFFINE_END))
  else if (time < T_TANH_END) {
    const a = affineXY(base)
    out = mix2(a, activateXY(a), progress(time, T_AFFINE_END, T_TANH_END))
  } else out = activateXY(affineXY(base))
  if (time >= T_TANH_END) {
    const p = progress(time, T_TANH_END, T_LAYOUT_END)
    out = mix2(out, [.83 * out[0] - 4.25, .83 * out[1]], p)
  }
  return out
}

const forward = x => {
  const z = add2(mul2(W1, x), B1), h = z.map(globalThis.Math.tanh), logits = add2(mul2(W2, h), B2)
  const maximum = globalThis.Math.max.apply(null, logits), exps = logits.map(value => globalThis.Math.exp(value - maximum)), sum = exps[0] + exps[1]
  return [z, h, exps.map(value => value / sum)]
}
const FORWARD = forward(SAMPLE)
const H_VALUE = FORWARD[1], OUT_VALUE = FORWARD[2], VALUES = [SAMPLE, H_VALUE, OUT_VALUE]

const GRID_PATHS = [
  ...Array.from({ length: 17 }, (_, ix) => {
    const x = -2 + 4 * ix / 16
    return Array.from({ length: 81 }, (_, iy) => coord([x, -1.5 + 3 * iy / 80]))
  }),
  ...Array.from({ length: 13 }, (_, iy) => {
    const y = -1.5 + 3 * iy / 12
    return Array.from({ length: 101 }, (_, ix) => coord([-2 + 4 * ix / 100, y]))
  }),
]
const GRID_OPACITY = [
  ...Array.from({ length: 17 }, (_, ix) => globalThis.Math.abs(-2 + 4 * ix / 16) < 1e-8 ? .55 : .23),
  ...Array.from({ length: 13 }, (_, iy) => globalThis.Math.abs(-1.5 + 3 * iy / 12) < 1e-8 ? .55 : .23),
]

let finalGridItems = null
function gridItems(time) {
  if (time >= T_LAYOUT_END && finalGridItems) return finalGridItems
  const reveal = progress(time, 0, .8), items = []
  GRID_PATHS.forEach((path, pathIndex) => {
    const segmentCount = path.length - 1, visible = reveal * segmentCount
    const whole = globalThis.Math.min(segmentCount, globalThis.Math.floor(visible)), fraction = clamp01(visible - whole)
    const transformed = path.map(point => transformPoint(point, time)), color = rgba(BLUE, GRID_OPACITY[pathIndex])
    for (let i = 0; i < whole; i++) items.push([transformed[i][0], transformed[i][1], transformed[i + 1][0], transformed[i + 1][1], color, 1])
    if (whole < segmentCount && fraction > 1e-9) {
      const a = transformed[whole], end = mix2(a, transformed[whole + 1], fraction)
      items.push([a[0], a[1], end[0], end[1], color, 1])
    }
  })
  const result = items.length ? items : [[0, 0, 1e-9, 0, rgba(BLUE, 0), 1]]
  if (time >= T_LAYOUT_END) finalGridItems = result
  return result
}

const POINTS_BASE = POINTS.map(coord), SELECTED_BASE = coord(SAMPLE)
let finalCloudItems = null
const cloudItems = time => {
  if (time >= T_LAYOUT_END && finalCloudItems) return finalCloudItems
  const result = POINTS_BASE.map((point, index) => {
    const p = transformPoint(point, time)
    return [p[0], p[1], .035, index < 36 ? BLUE : GOLD]
  })
  if (time >= T_LAYOUT_END) finalCloudItems = result
  return result
}
let finalSelectedItems = null
const selectedItems = time => {
  if (time >= T_LAYOUT_END && finalSelectedItems) return finalSelectedItems
  const p = transformPoint(SELECTED_BASE, time)
  const result = [[p[0], p[1], .065, GOLD]]
  if (time >= T_LAYOUT_END) finalSelectedItems = result
  return result
}
function edgeItems() {
  const items = []
  ;[W1, W2].forEach((weights, layer) => {
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const a = [COLUMNS[layer], YS[i]], b = [COLUMNS[layer + 1], YS[j]]
      const dx = b[0] - a[0], dy = b[1] - a[1], len = globalThis.Math.hypot(dx, dy), ux = dx / len, uy = dy / len
      const weight = weights[j][i]
      items.push([a[0] + .36 * ux, a[1] + .36 * uy, b[0] - .36 * ux, b[1] - .36 * uy, rgba(weight > 0 ? GOLD : BLUE, .34), 1 + globalThis.Math.abs(weight)])
    }
  })
  return items
}
function nodeTarget(layer, value) {
  const color = layer === 0 ? BLUE : value >= 0 ? GOLD : BLUE
  const opacity = layer === 0 ? .12 + .30 * globalThis.Math.min(globalThis.Math.abs(value), 1) : .10 + .45 * globalThis.Math.min(globalThis.Math.abs(value), 1)
  const rgb = parseHex(color)
  return [[rgb[0], rgb[1], rgb[2], opacity], color]
}
let finalNodeItems = null
function nodeItems(time) {
  if (time >= T_OUTPUT_HIGHLIGHT_END && finalNodeItems) return finalNodeItems
  const out = []
  VALUES.forEach((values, layer) => {
    const span = layer === 0 ? [T_LAYOUT_END, T_INPUT_HIGHLIGHT_END] : layer === 1 ? [T_HIDDEN_PULSE_END, T_HIDDEN_HIGHLIGHT_END] : [T_OUTPUT_PULSE_END, T_OUTPUT_HIGHLIGHT_END]
    const p = progress(time, span[0], span[1])
    values.forEach((value, index) => {
      const target = nodeTarget(layer, value), pos = NODE_POSITIONS[layer * 2 + index]
      out.push([pos[0], pos[1], .34, blend([8, 11, 16, 1], target[0], p), blend(parseHex(MUTED), parseHex(target[1]), p), 2])
    })
  })
  if (time >= T_OUTPUT_HIGHLIGHT_END) finalNodeItems = out
  return out
}
function pulseItems(layer, time) {
  const span = layer === 0 ? [T_INPUT_HIGHLIGHT_END, T_HIDDEN_PULSE_END] : [T_HIDDEN_HIGHLIGHT_END, T_OUTPUT_PULSE_END]
  const p = progress(time, span[0], span[1], false), weights = layer === 0 ? W1 : W2, source = VALUES[layer], items = []
  for (let index = 0; index < 4; index++) {
    const j = globalThis.Math.floor(index / 2), i = index % 2, a = [COLUMNS[layer], YS[i]], b = [COLUMNS[layer + 1], YS[j]]
    const dx = b[0] - a[0], dy = b[1] - a[1], len = globalThis.Math.hypot(dx, dy), ux = dx / len, uy = dy / len
    const from = [a[0] + .36 * ux, a[1] + .36 * uy], to = [b[0] - .36 * ux, b[1] - .36 * uy], q = mix2(from, to, p)
    const contribution = weights[j][i] * source[i]
    items.push([q[0], q[1], .035 + .028 * globalThis.Math.min(globalThis.Math.abs(contribution), 1), contribution >= 0 ? GOLD : BLUE])
  }
  return items
}
function labelItems(layer) {
  return VALUES[layer].map((value, index) => {
    const pos = NODE_POSITIONS[layer * 2 + index]
    const label = layer < 2 ? (value >= 0 ? '+' : '') + value.toFixed(2) : value.toFixed(2)
    return [pos[0], pos[1], label, WHITE, 19, 500]
  })
}

export async function neuralForwardPass(canvas) {
  const rect = canvas.getBoundingClientRect(), scale = globalThis.Math.max(.2, rect.width / 1920)
  const scene = await Scene.create(canvas, { fps: 60, renderer: { unitSize: 135 * scale, background: BG } })

  const grid = new DynamicLineSet(gridItems, { zIndex: 0 })
  const cloud = new DynamicCircleSet(cloudItems, { opacity: 0, zIndex: 2 })
  const selected = new DynamicCircleSet(selectedItems, { opacity: 0, zIndex: 5 })
  const stageXSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 28pt, fill: rgb(\"#58b9f2\"))\n#text(\"x\")\n')
  const stageAffineSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 28pt, fill: rgb(\"#58b9f2\"))\n#text(\"Wx + b\")\n')
  const stageTanhSource = new Typst('#set page(width: auto, height: auto, margin: 0pt, fill: none)\n#set text(size: 28pt, fill: rgb(\"#ffd166\"))\n#text(\"tanh(Wx + b)\")\n')
  await Promise.all([stageXSource.ready, stageAffineSource.ready, stageTanhSource.ready])
  const affineMorph = prepareVectorMorph(stageXSource.document, stageAffineSource.document)
  const tanhMorph = prepareVectorMorph(stageAffineSource.document, stageTanhSource.document)
  const stageDocument = time => {
    if (time < T_INPUT_END) return stageXSource.document
    if (time < T_AFFINE_END) return affineMorph.sample(progress(time, T_INPUT_END, T_AFFINE_END))
    if (time < T_TANH_END) return tanhMorph.sample(progress(time, T_AFFINE_END, T_TANH_END))
    return stageTanhSource.document
  }
  const stage = new DynamicVectorObject2D(stageDocument, { opacity: 0, transform: Transform2D.translation(0, 3.6), zIndex: 12 })

  scene.add(grid, cloud, selected, stage)
  scene.parallel(.8, api => { api.fadeIn(cloud); api.fadeIn(selected); api.fadeIn(stage) })
  scene.wait(3.4)

  const edges = new LineSet(edgeItems(), { zIndex: 0 })
  const nodes = new DynamicCircleSet(nodeItems, { zIndex: 2 })
  const headings = new Group([
    new Text('x', { fontSize: 24, color: BLUE, transform: Transform2D.translation(COLUMNS[0], 2.25) }),
    new Text('tanh', { fontSize: 24, color: GOLD, transform: Transform2D.translation(COLUMNS[1], 2.25) }),
    new Text('softmax', { fontSize: 24, color: GOLD, transform: Transform2D.translation(COLUMNS[2], 2.25) }),
  ], { zIndex: 8 })
  const network = new Group([edges, nodes, headings], { transform: Transform2D.translation(-.25, 0), opacity: 0 })
  scene.add(network)
  scene.parallel(1.2, api => {
    api.fadeIn(network)
    api.affine(network, { position: [0, 0] })
    api.affine(stage, { position: [-4.25, 2.25], scale: .72 })
  })

  const selectedFinal = transformPoint(SELECTED_BASE, T_LAYOUT_END)
  const halo = new Circle(.13, { fill: null, stroke: GOLD, width: 2, trim: 0, transform: Transform2D.translation(selectedFinal[0], selectedFinal[1]), zIndex: 9 })
  const inputLabels = new TextSet(labelItems(0), { opacity: 0, zIndex: 10 })
  scene.add(halo, inputLabels)
  scene.parallel(.5, api => { api.create(halo); api.fadeIn(inputLabels) })

  const pulse1 = new DynamicCircleSet(time => pulseItems(0, time), { zIndex: 11 })
  scene.add(pulse1); scene.wait(.9); scene.remove(pulse1)
  const hiddenLabels = new TextSet(labelItems(1), { opacity: 0, zIndex: 10 })
  scene.add(hiddenLabels); scene.fadeIn(hiddenLabels, { duration: .5 })

  const pulse2 = new DynamicCircleSet(time => pulseItems(1, time), { zIndex: 11 })
  scene.add(pulse2); scene.wait(.9); scene.remove(pulse2)
  const outputLabels = new TextSet(labelItems(2), { opacity: 0, zIndex: 10 })
  scene.add(outputLabels); scene.fadeIn(outputLabels, { duration: .6 })

  const winner = OUT_VALUE[0] >= OUT_VALUE[1] ? 0 : 1, winnerPos = NODE_POSITIONS[4 + winner]
  const ring = new Circle(.43, { fill: null, stroke: GOLD, width: 2, trim: 0, transform: Transform2D.translation(winnerPos[0], winnerPos[1]), zIndex: 9 })
  scene.add(ring)
  scene.parallel(.4, api => { api.create(ring); api.scale(halo, 1.3, { about: selectedFinal }) })
  scene.wait(.8)
  return scene
}

export const neuralForwardPassReference = Object.freeze({
  duration: 10,
  sample: SAMPLE,
  hidden: H_VALUE,
  output: OUT_VALUE,
  timings: [0, 1, 2.6, 4.2, 5.4, 5.9, 6.8, 7.3, 8.2, 8.8, 9.2, 10],
})
