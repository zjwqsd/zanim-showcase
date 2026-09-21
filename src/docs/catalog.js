import { scenes } from '../scenes/index.js'

const zanimZh = {
  basics: ['核心对象与 Scene', '对象描述初始状态，Scene 在 add() 后负责生命周期与时间轴。', ['Scene', 'Square', 'Circle', 'Arrow']],
  state: ['Scene 状态模型', '对比声明态、Scene-owned authored state 与对象生命周期。', ['Scene.add', 'Scene.remove', 'Group', 'authored state']],
  layout: ['布局系统', 'Row / Column / Grid 既能静态排版，也能成为动画目标。', ['Row', 'Column', 'Grid', 'Scene.layout']],
  timeline: ['时间轴组合', '顺序、并行、局部偏移与插值共享同一条绝对时间轴。', ['Scene.parallel', 'at', 'wait', 'Easing']],
  transforms: ['坐标系与相机', 'LOCAL / PARENT / WORLD 明确决定相对运动在哪个基底解释。', ['LOCAL', 'PARENT', 'WORLD', 'Camera2D']],
  batches: ['批量几何', 'CircleSet / LineSet 把高密度几何压到少量 retained batch。', ['CircleSet', 'LineSet', 'Scene.batch']],
  kinematics: ['正向运动学', '嵌套 Group 与父子坐标系直接表达串联机械臂。', ['Group', 'Transform2D', 'PARENT']],
  infinite: ['无限平面与线性变换', '无限网格直接接受线性映射，适合线性代数与坐标空间演示。', ['InfiniteGrid', 'InfiniteLine', 'Transform2D']],
  'interactive-linear': ['交互式线性代数', '指针直接驱动 retained Scene，展示浏览器交互能力。', ['Scene', 'InfiniteGrid', 'pointer events']],
  math: ['数学与动态几何', '公式、函数曲线、动态数字、面积和矩阵都按绝对时间求值。', ['Math', 'FunctionPlot', 'DynamicNumber', 'ScalarValue']],
  media: ['外部媒体', 'Image / GIF / Video / Audio 与普通对象共享 Scene 时间轴。', ['Image', 'GIF', 'Video', 'Audio']],
  vectors: ['矢量文档', 'SVG / Typst 编译后的矢量资源仍可 reveal、transform 与 morph。', ['VectorObject2D', 'VectorDocument']],
  fourier: ['傅里叶绘图', '从 SVG 轮廓采样、计算 DFT，再用旋转向量重建路径。', ['FourierEpicycles', 'VectorObject2D']],
  hilbert: ['Hilbert 曲线', '递归路径生成与逐步 reveal。', ['Polyline', 'Create']],
  fractals: ['经典路径分形', '用确定性递归几何展示 Koch / Sierpiński 等结构。', ['Polyline', 'Group']],
  modular: ['模乘圆', '用大量弦线展示模乘映射的几何结构。', ['LineSet', 'Circle']],
  bezier: ['De Casteljau', '把 Bézier 插值构造过程直接动画化。', ['Polyline', 'Dynamic geometry']],
  mandelbrot: ['Mandelbrot 与 Julia', 'WASM 分形渲染与参数空间 / 动力系统对应。', ['MandelbrotSet', 'JuliaSet', 'WASM']],
  complex: ['复映射', '网格经复函数连续映射，展示变形过程。', ['ComplexMappedGrid', 'Transform2D']],
  'electric-field': ['移动电场', '点电荷运动时，矢量场与瞬时积分流线同步更新。', ['DynamicLineSet', 'DynamicCircleSet']],
  'neural-network': ['批量神经网络', '连接和节点使用 batch primitive，逐层传播激活。', ['LineSet', 'CircleSet', 'Scene.batch']],
  sorting: ['排序算法', '同一排列依次展示 Bubble / Selection / Insertion / Merge / Quick / Heap。', ['LineSet', 'algorithm trace']],
  'red-black-tree': ['红黑树', '真实 CLRS 插入、重着色和旋转状态逐步可视化。', ['CircleSet', 'LineSet', 'tree trace']],
  collisions: ['弹性碰撞模拟', '固定步长 240 Hz 的确定性硬球模拟，可任意 seek。', ['Simulation', 'DynamicCircleSet']],
  'rubiks-cube': ['Rubik 魔方', '27 个 cubie 的 3D 分层转动、打乱与逆序复原。', ['Scene3DLayer', 'MeshObject3D', 'Transform3D']],
  compositing: ['Scene 合成', '一个 Scene 可作为另一个 Scene 的 raster source，再参与遮罩与组合。', ['SceneRasterObject2D', 'CustomObject2D']],
  'three-d': ['3D Scene', '2D 文本与 3D mesh 共用同一 Scene 绝对时间。', ['Camera3D', 'Scene3DLayer', 'MeshObject3D']],
  'neural-forward-demo': ['神经网络前向传播 Demo', '另一份 Python 实现，用于验证动态几何表达。', ['DynamicLineSet', 'DynamicCircleSet']],
  'neural-forward': ['神经网络前向传播', '点云、仿射变换、激活与逐层信号传播组成完整示例。', ['DynamicLineSet', 'DynamicCircleSet', 'DynamicTextSet']],
}

const noteZh = {
  'interactive-linear': '指针直接修改 retained Scene 状态，不依赖预先编排的时间轴。',
  math: 'Math 由 @zanim/web/vite 在构建阶段预编译成 SVG；生产浏览器只加载生成后的矢量资源。',
  fourier: '浏览器读取 fourier_heart.svg，采样闭合路径、计算 DFT，再直接驱动 FourierEpicycles。',
  sorting: '浏览器使用 Python example 生成的真实算法 trace。',
  'red-black-tree': '插入、重着色与旋转状态直接来自 Python CLRS 实现。',
  collisions: 'Python 端以 240 Hz 固定步长模拟，再采样为确定性的浏览器状态数据。',
  'neural-forward-demo': '同一个前向传播视觉目标的另一份 Python 实现。',
}

const janimZh = {
  'janim-hello': ['Hello JAnim 复刻', '最基础的对象、文字与出场效果。'],
  'janim-basic': ['基础动画', '移动、缩放、旋转等常用变换。'],
  'janim-text': ['Text', '文本排版与 reveal。'],
  'janim-typst': ['Typst', 'Typst 矢量公式渲染。'],
  'janim-colorize': ['Typst 着色', '公式 token 分组与局部着色。'],
  'janim-pi': ['Animating π', '大量矢量 glyph 的绝对时间变形。'],
  'janim-plane': ['Number Plane', '坐标平面与连续变换。'],
  'janim-updater': ['Updater', '按绝对时间重新表达 updater 效果。'],
  'janim-arrow': ['Arrow Pointing', '箭头几何与方向更新。'],
  'janim-combine': ['Combine Updaters', '多个动态更新效果组合。'],
  'janim-pie': ['Rotating Pie', '扇形与旋转。'],
  'janim-marked': ['Marked Item', '标注与强调效果。'],
  'janim-frame-effect': ['Frame Effect', 'Canvas 后处理风格的帧效果。'],
  'janim-mask': ['Mask', '多阶段遮罩、布尔区域与 feather。'],
  'janim-3d-shapes': ['3D Shapes', 'Torus / Cylinder / Cone 的多种网格显示风格。'],
  'janim-balls': ['Balls Collision', '25 个等质量小球的完全弹性碰撞，以及相机缩放与跟随。'],
}

const manimZh = {
  'manim-logo': ['ManimCELogo', '复刻 Manim Community Logo 的基础几何组合。'],
  'manim-brace': ['BraceAnnotation', '线段、端点与 brace 风格标注。'],
  'manim-vector': ['VectorArrow', '坐标平面、向量和端点标签。'],
  'manim-gradient': ['GradientImageFromArray', '用真实栅格图像重现数组生成的灰度渐变。'],
  'manim-boolean': ['BooleanOperations', '用重叠几何展示 Intersection / Union / Difference / Exclusion 的视觉语义。'],
  'manim-point-shapes': ['PointMovingOnShapes', '点先平移到圆周，随后沿圆运动，并绕指定点旋转。'],
  'manim-moving-around': ['MovingAround', '组合平移、旋转与缩放。'],
  'manim-angle': ['MovingAngle', '标量驱动的动态射线和角度弧。'],
  'manim-dots': ['MovingDots', '两个动态点与实时更新的连接线。'],
  'manim-group-destination': ['MovingGroupToDestination', 'Group 保持内部结构整体移动到目标区域。'],
  'manim-frame-box': ['MovingFrameBox', '强调框在公式的不同区域之间移动。'],
  'manim-rotation-updater': ['RotationUpdater', '使用绝对时间 provider 表达持续旋转 updater。'],
  'manim-trace': ['PointWithTrace', '移动点与随时间增长的轨迹。'],
  'manim-sin-cos': ['SinAndCosFunctionPlot', '同一坐标系中的 sin / cos 曲线与标记。'],
  'manim-argmin': ['ArgMinExample', '动态点沿二次函数移动到最小值。'],
  'manim-area': ['GraphAreaPlot', '多条函数曲线与 Riemann rectangle / 面积表达。'],
  'manim-polygon-axes': ['PolygonOnAxes', '点沿 xy=k 曲线运动，同时更新矩形。'],
  'manim-heat': ['HeatDiagramPlot', '分段数据曲线与节点。'],
  'manim-follow-camera': ['FollowingGraphCamera', '相机与曲线上运动对象协同变化。'],
  'manim-zoom-camera': ['MovingZoomedSceneAround', '移动与缩放 focus 区域，复刻 zoomed scene 的视觉关系。'],
  'manim-fixed-frame': ['FixedInFrameMObjectTest', '世界内容随相机变化，固定说明保持屏幕语义。'],
  'manim-light-source': ['ThreeDLightSourcePosition', '3D 几何与不同空间位置的体块关系。'],
  'manim-3d-camera': ['ThreeDCameraRotation', '3D 对象持续旋转，展示相机投影下的空间变化。'],
  'manim-3d-illusion': ['ThreeDCameraIllusionRotation', '三轴几何同步旋转形成相机运动的视觉错觉。'],
  'manim-surface': ['ThreeDSurfacePlot', '采样二维函数并用小型 3D tile 构成曲面。'],
  'manim-opening': ['OpeningManim', '文字、公式、坐标平面与相机运动的连续开场。'],
  'manim-sine-circle': ['SineCurveUnitCircle', '单位圆运动点实时生成正弦曲线。'],
}

const upstreamManim = {
  'manim-logo': 'manimcelogo',
  'manim-brace': 'braceannotation',
  'manim-vector': 'vectorarrow',
  'manim-gradient': 'gradientimagefromarray',
  'manim-boolean': 'booleanoperations',
  'manim-point-shapes': 'pointmovingonshapes',
  'manim-moving-around': 'movingaround',
  'manim-angle': 'movingangle',
  'manim-dots': 'movingdots',
  'manim-group-destination': 'movinggrouptodestination',
  'manim-frame-box': 'movingframebox',
  'manim-rotation-updater': 'rotationupdater',
  'manim-trace': 'pointwithtrace',
  'manim-sin-cos': 'sinandcosfunctionplot',
  'manim-argmin': 'argminexample',
  'manim-area': 'graphareaplot',
  'manim-polygon-axes': 'polygononaxes',
  'manim-heat': 'heatdiagramplot',
  'manim-follow-camera': 'followinggraphcamera',
  'manim-zoom-camera': 'movingzoomedscenearound',
  'manim-fixed-frame': 'fixedinframemobjecttest',
  'manim-light-source': 'threedlightsourceposition',
  'manim-3d-camera': 'threedcamerarotation',
  'manim-3d-illusion': 'threedcameraillusionrotation',
  'manim-surface': 'threedsurfaceplot',
  'manim-opening': 'openingmanim',
  'manim-sine-circle': 'sinecurveunitcircle',
}

const zanimGroups = [
  { id: 'zanim-basic', title: '基础概念', intro: '对象、Scene、布局与资源。', ids: ['basics', 'state', 'layout', 'vectors', 'media'] },
  { id: 'zanim-animation', title: '动画与时间轴', intro: '时间轴、坐标系、批量几何与 Scene 合成。', ids: ['timeline', 'transforms', 'batches', 'compositing'] },
  { id: 'zanim-math', title: '数学与空间', intro: '公式、线性代数、函数曲线、坐标空间与运动学。', ids: ['math', 'kinematics', 'infinite', 'interactive-linear'] },
  { id: 'zanim-advanced', title: '高级可视化', intro: '分形、傅里叶、复映射、电场与神经网络。', ids: ['fourier', 'hilbert', 'fractals', 'modular', 'bezier', 'mandelbrot', 'complex', 'electric-field', 'neural-network', 'neural-forward-demo', 'neural-forward'] },
  { id: 'zanim-algorithms', title: '算法与模拟', intro: '真实算法 trace 与确定性模拟。', ids: ['sorting', 'red-black-tree', 'collisions'] },
  { id: 'zanim-3d', title: '3D', intro: 'Zig/WASM 深度光栅化、3D mesh、相机和层级变换。', ids: ['three-d', 'rubiks-cube'] },
]

const manimGroups = [
  { id: 'manim-basic-concepts', title: 'Basic Concepts', intro: '对应 Manim 官方 Gallery 的基础概念分区。', ids: ['manim-logo', 'manim-brace', 'manim-vector', 'manim-gradient', 'manim-boolean'] },
  { id: 'manim-animations', title: 'Animations', intro: '运动、动态角度、updater 与轨迹。', ids: ['manim-point-shapes', 'manim-moving-around', 'manim-angle', 'manim-dots', 'manim-group-destination', 'manim-frame-box', 'manim-rotation-updater', 'manim-trace'] },
  { id: 'manim-plotting', title: 'Plotting with Manim', intro: '函数曲线、最值、面积和数据图。', ids: ['manim-sin-cos', 'manim-argmin', 'manim-area', 'manim-polygon-axes', 'manim-heat'] },
  { id: 'manim-camera', title: 'Special Camera Settings', intro: '跟随、缩放、固定屏幕元素与 3D 相机相关示例。', ids: ['manim-follow-camera', 'manim-zoom-camera', 'manim-fixed-frame', 'manim-light-source', 'manim-3d-camera', 'manim-3d-illusion', 'manim-surface'] },
  { id: 'manim-advanced-projects', title: 'Advanced Projects', intro: '较长的综合演示。', ids: ['manim-opening', 'manim-sine-circle'] },
]

const janimGroups = [
  { id: 'janim-foundation', title: '基础与文本', intro: 'Hello、基础动画、Text、Typst、π 网格与 NumberPlane。', ids: ['janim-hello', 'janim-basic', 'janim-text', 'janim-typst', 'janim-colorize', 'janim-pi', 'janim-plane'] },
  { id: 'janim-updaters', title: 'Updater 与组合', intro: 'DataUpdater / GroupUpdater / MarkedItem 等动态行为的 Zanim absolute-time 表达。', ids: ['janim-updater', 'janim-arrow', 'janim-combine', 'janim-pie', 'janim-marked'] },
  { id: 'janim-effects', title: '效果与 3D', intro: 'Frame Effect、3D Shapes 与 ShapeMask。', ids: ['janim-frame-effect', 'janim-3d-shapes', 'janim-mask'] },
  { id: 'janim-simulation', title: 'Simulation', intro: '确定性物理模拟与跟随相机。', ids: ['janim-balls'] },
]

export const manimCollection = {
  id: 'manim',
  title: 'Manim Example Gallery 复刻',
  intro: '按 Manim Community v0.21.0 官方 Example Gallery 的五个分区整理，共 27 个条目；用 Zanim Web runtime 重新实现对应视觉目标。',
  groups: manimGroups,
}

export const janimCollection = {
  id: 'janim',
  title: 'JAnim API Demonstration 复刻',
  intro: '对应 JAnim 5.0.0-rc4 文档中的 API Demonstration，共 16 个官方示例；使用 Zanim 的显式生命周期与绝对时间模型重新实现。',
  groups: janimGroups,
}

export const galleryCollections = [
  {
    id: 'zanim',
    title: 'Zanim 原生示例',
    intro: 'Zanim 自己设计的教程型与能力型 examples，优先展示状态模型、绝对时间、批量几何、数学可视化和 3D。',
    groups: zanimGroups,
  },
]

const catalogCollections = [...galleryCollections, manimCollection, janimCollection]

export const galleryGroups = catalogCollections.flatMap((collection) =>
  collection.groups.map((group) => ({ ...group, collection: collection.id, collectionTitle: collection.title })),
)

const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]))

function itemText(id, scene) {
  if (zanimZh[id]) return zanimZh[id]
  if (manimZh[id]) return [...manimZh[id], ['Manim Community v0.21.0', '@zanim/web']]
  if (janimZh[id]) return [...janimZh[id], ['JAnim', '@zanim/web']]
  return [scene.title, 'Zanim 示例。', ['@zanim/web']]
}

export const galleryItems = galleryGroups.flatMap((group) =>
  group.ids.map((id) => {
    const scene = sceneMap.get(id)
    if (!scene) throw new Error(`gallery scene not found: ${id}`)
    const [titleZh, description, refs] = itemText(id, scene)
    return {
      ...scene,
      category: group.id,
      categoryTitle: group.title,
      collection: group.collection,
      collectionTitle: group.collectionTitle,
      titleZh,
      description,
      note: noteZh[id] ?? scene.note ?? (scene.static && group.collection === 'manim' ? 'Manim 官方原例为静态场景，因此这里直接展示静态 Scene，不提供播放进度条。' : ''),
      references: refs,
      upstreamUrl: upstreamManim[id]
        ? `https://docs.manim.community/en/stable/examples.html#${upstreamManim[id]}`
        : null,
    }
  }),
)

export const galleryById = new Map(galleryItems.map((item) => [item.id, item]))

export function categoryItems(groupId) {
  return galleryItems.filter((item) => item.category === groupId)
}
