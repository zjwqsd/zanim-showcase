import {
  BLUE,
  Box3D,
  Camera3D,
  Circle,
  CustomObject2D,
  DynamicTextSet,
  GREEN,
  Group,
  MeshObject3D,
  ORANGE,
  Rectangle,
  Scene,
  Scene3DLayer,
  SceneRasterObject2D,
  Square,
  Transform2D,
  Transform3D,
  TriangleMesh,
  Vec3,
  WHITE,
  unitBoxMesh,
} from '@zanim/web'

const T2 = (x = 0, y = 0, rotation = 0, scale = 1) =>
  Transform2D.affine({ position: [x, y], rotation, scale })

async function makeScene(canvas, { width = 1280, unitSize = 95, background = '#080b12' } = {}) {
  const rect = canvas.getBoundingClientRect()
  const scale = Math.max(0.2, rect.width / width)
  return Scene.create(canvas, {
    fps: 60,
    renderer: { unitSize: unitSize * scale, background },
  })
}

function hiddenCanvas(width = 480, height = 320) {
  const canvas = document.createElement('canvas')
  Object.assign(canvas.style, {
    position: 'fixed',
    left: '-10000px',
    top: '-10000px',
    width: `${width}px`,
    height: `${height}px`,
    opacity: '0',
    pointerEvents: 'none',
  })
  document.body.appendChild(canvas)
  return canvas
}

async function childScene(width = 480, height = 320) {
  const canvas = hiddenCanvas(width, height)
  const scene = await Scene.create(canvas, {
    fps: 60,
    observeResize: false,
    renderer: { unitSize: 70, background: '#080b12' },
  })
  const originalDestroy = scene.destroy.bind(scene)
  scene.destroy = () => {
    originalDestroy()
    canvas.remove()
  }
  return scene
}

// -----------------------------------------------------------------------------
// Scene compositing
// -----------------------------------------------------------------------------

async function buildContentScene() {
  const scene = await childScene()
  const square = new Square(1.35, { fill: 'rgba(70,135,255,.88)', stroke: WHITE, transform: T2(-1.25, .45, -.2) })
  const circle = new Circle(.82, { fill: 'rgba(255,164,82,.88)', stroke: WHITE, transform: T2(1.15, -.35) })
  const bar = new Rectangle(3.8, .35, { fill: 'rgba(80,205,145,.82)', stroke: null, transform: T2(0, -1.35, .12) })
  const group = new Group([square, circle, bar])
  scene.add(group)
  scene.transformFunction(
    group,
    (a) => T2(0, 0, .8 * Math.PI * a, 1 + .08 * a),
    { duration: 4 },
  )
  return scene
}

async function buildMaskScene() {
  const scene = await childScene()
  const aperture = new Circle(1.25, { fill: WHITE, stroke: null, transform: T2(-1.75, 0, 0, .8) })
  scene.add(aperture)
  scene.transformFunction(
    aperture,
    (a) => T2(-1.75 + 3.5 * a, .35 * Math.sin(2 * Math.PI * a), 0, .8 + .55 * Math.sin(Math.PI * a)),
    { duration: 4 },
  )
  return scene
}

export async function compositingScene(canvas) {
  const scene = await makeScene(canvas, { width: 1280, unitSize: 90 })
  const content = await buildContentScene()
  const mask = await buildMaskScene()
  const contentView = new SceneRasterObject2D(content, {
    width: 3.7,
    sourceTime: (time) => Math.min(4, time),
    transform: T2(-4.25, -.55),
    ownsScene: true,
  })
  const maskView = new SceneRasterObject2D(mask, {
    width: 3.7,
    sourceTime: (time) => Math.min(4, time),
    transform: T2(0, -.55),
    ownsScene: true,
  })

  const scratch = document.createElement('canvas')
  const result = new CustomObject2D(({ renderer, ctx, time, transform }) => {
    const t = Math.min(4, time)
    content.seek(t)
    mask.seek(t)
    const cw = content.renderer.canvas.width
    const ch = content.renderer.canvas.height
    scratch.width = cw
    scratch.height = ch
    const sctx = scratch.getContext('2d')
    sctx.clearRect(0, 0, cw, ch)
    sctx.globalCompositeOperation = 'source-over'
    sctx.drawImage(content.renderer.canvas, 0, 0)
    sctx.globalCompositeOperation = 'destination-in'
    sctx.drawImage(mask.renderer.canvas, 0, 0)
    sctx.globalCompositeOperation = 'source-over'

    const u = renderer.unitSize
    const ox = renderer.canvas.width * .5
    const oy = renderer.canvas.height * .5
    ctx.save()
    ctx.setTransform(
      u * transform.xx,
      -u * transform.yx,
      u * transform.xy,
      -u * transform.yy,
      ox + u * transform.tx,
      oy - u * transform.ty,
    )
    ctx.scale(1, -1)
    ctx.drawImage(scratch, -1.85, -1.233, 3.7, 2.466)
    ctx.restore()
  }, { transform: T2(4.25, -.55), zIndex: 2 })

  scene.add(
    new DynamicTextSet(() => [
      [0, 3.15, 'A Scene can become raster data for another Scene', '#ffffff', 29, 650],
      [0, 2.67, 'content Scene + mask Scene → composited raster object', '#8e99ac', 17, 500],
      [-4.25, 1.65, 'content', '#8e99ac', 18, 500],
      [0, 1.65, 'mask alpha', '#8e99ac', 18, 500],
      [4.25, 1.65, 'result', '#8e99ac', 18, 500],
    ], { zIndex: 10 }),
    contentView,
    maskView,
    result,
  )
  scene.wait(4.35)

  const originalDestroy = scene.destroy.bind(scene)
  scene.destroy = () => {
    originalDestroy()
    if (content.renderer?.canvas?.isConnected) content.destroy()
    if (mask.renderer?.canvas?.isConnected) mask.destroy()
  }
  return scene
}

// -----------------------------------------------------------------------------
// 3D surface + cube
// -----------------------------------------------------------------------------

function terrain(x, z) {
  const r = Math.hypot(x, z)
  return .38 * Math.sin(2.3 * r) / (1 + .18 * r * r)
}

function terrainMesh(size = 37) {
  const vertices = []
  const normals = []
  const indices = []
  const min = -2.4
  const max = 2.4
  const h = .02
  for (let iz = 0; iz < size; iz++) {
    const z = min + (max - min) * iz / (size - 1)
    for (let ix = 0; ix < size; ix++) {
      const x = min + (max - min) * ix / (size - 1)
      const y = terrain(x, z)
      const dx = (terrain(x + h, z) - terrain(x - h, z)) / (2 * h)
      const dz = (terrain(x, z + h) - terrain(x, z - h)) / (2 * h)
      const nx = -dx
      const ny = 1
      const nz = -dz
      const len = Math.hypot(nx, ny, nz)
      vertices.push(new Vec3(x, y, z))
      normals.push(new Vec3(nx / len, ny / len, nz / len))
    }
  }
  for (let iz = 0; iz < size - 1; iz++) {
    for (let ix = 0; ix < size - 1; ix++) {
      const a = iz * size + ix
      const b = a + 1
      const c = a + size
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  return new TriangleMesh(vertices, normals, indices)
}

export async function threeDShowcaseScene(canvas) {
  const scene = await makeScene(canvas, { width: 1280, unitSize: 90 })
  const camera = new Camera3D({
    position: new Vec3(6.2, 4.15, 7.15),
    target: new Vec3(.15, .05, 0),
    fovYDegrees: 35,
  })

  const cubeBase = Transform3D.translation(-2.35, .35, 0)
  const cube = Box3D(new Vec3(1.55, 1.55, 1.55), {
    color: BLUE,
    transform: (time) => cubeBase.mul(
      Transform3D.rotationAxis(new Vec3(1, 1, .35), 2 * Math.PI * Math.min(1, time / 5)),
    ),
  })
  const surface = new MeshObject3D(terrainMesh(), {
    color: GREEN,
    transform: (time) => Transform3D.translation(2.25, -.35, 0)
      .mul(Transform3D.rotationY(-.65 * Math.PI * Math.min(1, time / 5)))
      .mul(Transform3D.scaling(.72)),
  })
  const axes = [
    Box3D(new Vec3(2.3, .025, .025), { color: '#ef5866', transform: Transform3D.translation(.9, -1.55, 0) }),
    Box3D(new Vec3(.025, 2.3, .025), { color: GREEN, transform: Transform3D.translation(-.25, -.4, 0) }),
    Box3D(new Vec3(.025, .025, 2.3), { color: BLUE, transform: Transform3D.translation(-.25, -1.55, 1.15) }),
  ]

  scene.add(
    new Scene3DLayer([...axes, cube, surface], { camera, resolution: .9 }),
    new DynamicTextSet(() => [
      [0, 3.15, '2D and 3D share one Scene', '#ffffff', 28, 650],
      [-3.2, -3.0, 'SO(3)', '#dce7fb', 20, 600],
      [3.0, -3.0, 'Surface3D', '#dce7fb', 20, 600],
    ], { zIndex: 10 }),
  )
  scene.wait(5.35)
  return scene
}

// -----------------------------------------------------------------------------
// Rubik's Cube
// -----------------------------------------------------------------------------

const RUBIK_BODY = '#111418'
const FACE_COLORS = new Map([
  ['1,0,0', '#e0363e'],
  ['-1,0,0', '#ff8025'],
  ['0,1,0', '#f2f2ec'],
  ['0,-1,0', '#fcd32d'],
  ['0,0,1', '#2cb564'],
  ['0,0,-1', '#356fe0'],
])
const SCRAMBLE = [
  ['R', 'x', 1, -1],
  ['U', 'y', 1, 1],
  ['F', 'z', 1, -1],
  ['L', 'x', -1, 1],
  ['D', 'y', -1, -1],
  ['B', 'z', -1, 1],
  ['R', 'x', 1, -1],
  ["U'", 'y', 1, -1],
]
const TURN_DURATION = .52
const TURN_PAUSE = .07
const RUBIK_START = 1.35

function axisRotation(axis, quarter) {
  const angle = quarter * Math.PI / 2
  if (axis === 'x') return Transform3D.rotationX(angle)
  if (axis === 'y') return Transform3D.rotationY(angle)
  return Transform3D.rotationZ(angle)
}

function rotateCoord(coord, axis, quarter) {
  let [x, y, z] = coord
  const sign = quarter > 0 ? 1 : -1
  const count = Math.abs(quarter) % 4
  for (let i = 0; i < count; i++) {
    if (axis === 'x') [y, z] = sign > 0 ? [-z, y] : [z, -y]
    else if (axis === 'y') [x, z] = sign > 0 ? [z, -x] : [-z, x]
    else [x, y] = sign > 0 ? [-y, x] : [y, -x]
  }
  return [x, y, z]
}

function rubikMoves() {
  const reverse = [...SCRAMBLE].reverse().map(([name, axis, layer, quarter]) => [
    name.endsWith("'") ? name.slice(0, -1) : name + "'",
    axis,
    layer,
    -quarter,
  ])
  return [...SCRAMBLE, ...reverse]
}

const ALL_RUBIK_MOVES = rubikMoves()
const ROOT_ROTATION = Transform3D.rotationY(-.28).mul(Transform3D.rotationX(.18))

function pieceTransform(originalCoord, time) {
  let coord = [...originalCoord]
  let transform = Transform3D.translation(coord[0], coord[1], coord[2])
  let cursor = RUBIK_START
  for (const [, axis, layer, quarter] of ALL_RUBIK_MOVES) {
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    const affects = coord[axisIndex] === layer
    if (time < cursor) break
    if (time < cursor + TURN_DURATION) {
      if (affects) {
        const alpha = Math.max(0, Math.min(1, (time - cursor) / TURN_DURATION))
        const partial = axisRotation(axis, quarter * alpha)
        return ROOT_ROTATION.mul(partial.mul(transform))
      }
      return ROOT_ROTATION.mul(transform)
    }
    if (affects) {
      const rotation = axisRotation(axis, quarter)
      transform = rotation.mul(transform)
      coord = rotateCoord(coord, axis, quarter)
    }
    cursor += TURN_DURATION + TURN_PAUSE
    if (time < cursor) return ROOT_ROTATION.mul(transform)
  }
  return ROOT_ROTATION.mul(transform)
}

function cubieMeshes(coord) {
  const meshes = []
  const provider = (time) => pieceTransform(coord, time)
  meshes.push(new MeshObject3D(unitBoxMesh(), {
    transform: provider,
    geometryTransform: Transform3D.scaling(.92),
    color: RUBIK_BODY,
  }))

  const stickerSide = .72
  const stickerThickness = .035
  const offset = .92 * .5 + stickerThickness * .56
  for (const [key, color] of FACE_COLORS.entries()) {
    const face = key.split(',').map(Number)
    const [fx, fy, fz] = face
    const [x, y, z] = coord
    if (!((fx && x === fx) || (fy && y === fy) || (fz && z === fz))) continue
    let local
    if (fx) {
      local = Transform3D.translation(fx * offset, 0, 0).mul(Transform3D.scaling(stickerThickness, stickerSide, stickerSide))
    } else if (fy) {
      local = Transform3D.translation(0, fy * offset, 0).mul(Transform3D.scaling(stickerSide, stickerThickness, stickerSide))
    } else {
      local = Transform3D.translation(0, 0, fz * offset).mul(Transform3D.scaling(stickerSide, stickerSide, stickerThickness))
    }
    meshes.push(new MeshObject3D(unitBoxMesh(), {
      transform: provider,
      geometryTransform: local,
      color,
    }))
  }
  return meshes
}

function rubikLabel(time) {
  if (time < RUBIK_START) return ['R', 'Rubik\'s Cube · scramble']
  const index = Math.floor((time - RUBIK_START) / (TURN_DURATION + TURN_PAUSE))
  const clamped = Math.max(0, Math.min(ALL_RUBIK_MOVES.length - 1, index))
  return [ALL_RUBIK_MOVES[clamped][0], clamped < SCRAMBLE.length ? 'Rubik\'s Cube · scramble' : 'Rubik\'s Cube · reverse solve']
}

export async function rubiksCubeScene(canvas) {
  const scene = await makeScene(canvas, { width: 1280, unitSize: 108 })
  const meshes = []
  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) meshes.push(...cubieMeshes([x, y, z]))
    }
  }
  meshes.unshift(Box3D(new Vec3(5.8, .08, 5.2), {
    color: '#191d24',
    transform: Transform3D.translation(0, -1.72, 0),
  }))
  const camera = new Camera3D({
    position: new Vec3(6.4, 5.2, 7.6),
    target: new Vec3(0, .05, 0),
    fovYDegrees: 34,
  })

  scene.add(
    new Scene3DLayer(meshes, { camera, resolution: .82 }),
    new DynamicTextSet((time) => {
      const [move, title] = rubikLabel(time)
      return [
        [0, 2.83, title, '#ffffff', 27, 650],
        [5.15, -2.62, move, '#9db5de', 23, 600],
      ]
    }, { zIndex: 20 }),
  )
  const duration = RUBIK_START + ALL_RUBIK_MOVES.length * (TURN_DURATION + TURN_PAUSE) + .8
  scene.wait(duration)
  return scene
}
