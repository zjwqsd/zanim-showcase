import { scenes } from '../scenes/index.js'

const zh = {
  basics: ['核心对象与 Scene', '对象负责描述状态，Scene 在 add() 之后接管时间与后续变换。', ['Scene', 'Square', 'Circle', 'Arrow']],
  state: ['Scene 状态模型', '展示声明态、Scene-owned authored head 与对象生命周期边界。', ['Scene.add', 'Scene.remove', 'Group', 'authored state']],
  layout: ['布局系统', 'Row / Column / Grid 既可做一次性排版，也可作为动画目标。', ['Row', 'Column', 'Grid', 'Scene.layout']],
  timeline: ['时间轴组合', '顺序、并行、偏移和插值都落在同一条绝对时间轴上。', ['Scene.parallel', 'at', 'wait', 'Easing']],
  transforms: ['坐标系与相机', 'LOCAL / PARENT / WORLD 明确区分相对运动的解释基底。', ['LOCAL', 'PARENT', 'WORLD', 'Camera2D']],
  batches: ['批量几何', '用 CircleSet / LineSet 把高密度几何压到少量 draw call。', ['CircleSet', 'LineSet', 'Scene.batch']],
  kinematics: ['正向运动学', '嵌套变换与父子坐标系自然表达串联机械臂。', ['Group', 'Transform2D', 'PARENT']],
  infinite: ['无限平面与线性变换', '无限网格不依赖预先裁剪的有限几何，适合展示线性代数。', ['InfiniteGrid', 'InfiniteLine', 'Transform2D']],
  'interactive-linear': ['交互式线性代数', '指针直接驱动 retained Scene；不是预录时间轴。', ['Scene', 'InfiniteGrid', 'pointer events']],
  math: ['数学与动态几何', '公式、函数曲线、动态数字、面积与矩阵都由绝对时间求值。', ['Math', 'FunctionPlot', 'DynamicNumber', 'ScalarValue']],
  media: ['外部媒体', 'Image / GIF / Video / Audio 与普通 Zanim 对象共享同一时间轴。', ['Image', 'GIF', 'Video', 'Audio']],
  vectors: ['矢量文档', 'SVG/Typst 编译后的矢量资源仍可参与 reveal、transform 和 morph。', ['VectorObject2D', 'VectorDocument']],
  fourier: ['傅里叶绘图', '从 SVG 采样闭合轮廓、做 DFT，再用旋转向量逐步重建路径。', ['FourierEpicycles', 'VectorObject2D']],
  hilbert: ['Hilbert 曲线', '递归路径生成与逐步 reveal 的组合。', ['Polyline', 'Create']],
  fractals: ['经典路径分形', '用确定性递归几何展示 Koch / Sierpiński 等路径结构。', ['Polyline', 'Group']],
  modular: ['模乘圆', '用大量弦线展示模乘映射的几何结构。', ['LineSet', 'Circle']],
  bezier: ['De Casteljau', '直接把 Bezier 插值构造过程动画化。', ['Polyline', 'Dynamic geometry']],
  mandelbrot: ['Mandelbrot 与 Julia', 'WASM 分形渲染与参数空间 / 动力系统之间的对应。', ['MandelbrotSet', 'JuliaSet', 'WASM']],
  complex: ['复映射', '将网格通过复函数逐点映射，展示连续变形。', ['ComplexMappedGrid', 'Transform2D']],
  'electric-field': ['移动电场', '两点电荷运动时，矢量场和瞬时积分流线同步变化。', ['DynamicLineSet', 'DynamicCircleSet']],
  'neural-network': ['批量神经网络', '连接和节点都使用 batch primitive，逐层传播激活。', ['LineSet', 'CircleSet', 'Scene.batch']],
  sorting: ['排序算法', '同一随机排列依次运行 Bubble / Selection / Insertion / Merge / Quick / Heap。', ['LineSet', 'algorithm trace']],
  'red-black-tree': ['红黑树', '真实 CLRS 插入、重着色、左右旋转状态逐步可视化。', ['CircleSet', 'LineSet', 'tree trace']],
  collisions: ['弹性碰撞模拟', '固定步长 240 Hz 的确定性硬球模拟，可任意 seek。', ['Simulation', 'DynamicCircleSet']],
  'rubiks-cube': ['Rubik 魔方', '27 个 cubie 的真实 3D 分层转动、打乱与逆序复原。', ['Scene3DLayer', 'MeshObject3D', 'Transform3D']],
  compositing: ['Scene 合成', '一个 Scene 可以作为另一个 Scene 的 raster source，再参与遮罩与组合。', ['SceneRasterObject2D', 'CustomObject2D']],
  'three-d': ['3D Scene', '2D 文本与 3D mesh 共用同一 Scene 绝对时间。', ['Camera3D', 'Scene3DLayer', 'MeshObject3D']],
  'neural-forward-demo': ['神经网络前向传播 Demo', '同一视觉目标的另一份 Python 实现，用于验证动态几何表达。', ['DynamicLineSet', 'DynamicCircleSet']],
  'neural-forward': ['神经网络前向传播', '点云、仿射变换、激活和逐层信号传播组合成完整 10 秒示例。', ['DynamicLineSet', 'DynamicCircleSet', 'DynamicTextSet']],
}


const noteZh = {
  'interactive-linear': '指针直接修改 retained Scene 状态，不依赖预先编排的时间轴。',
  math: 'Math 由 @zanim/web/vite 在构建阶段预编译成 SVG；生产浏览器只加载生成后的矢量资源。',
  fourier: '浏览器读取 fourier_heart.svg，采样闭合路径、计算 DFT，再直接驱动 FourierEpicycles。',
  sorting: '浏览器使用 Python example 生成的真实算法 trace。',
  'red-black-tree': '插入、重着色与旋转状态直接来自 Python CLRS 实现。',
  collisions: 'Python 端以 240 Hz 固定步长模拟，再采样为确定性的浏览器状态数据。',
  'neural-forward-demo': '同一个 10 秒前向传播视觉目标的另一份 Python 实现。',
  'neural-forward': '忠实复刻给定的 Manim 前向传播演示：点云、权重、样本、非线性几何与信号时序保持一致。',
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
}

export const galleryGroups = [
  {
    id: 'basic',
    title: '基础概念',
    intro: '从对象、Scene、布局和资源开始，先建立 Zanim 的状态模型。',
    ids: ['basics', 'state', 'layout', 'vectors', 'media'],
  },
  {
    id: 'animation',
    title: '动画与时间轴',
    intro: '时间轴组合、坐标系、批量几何与 Scene 合成。',
    ids: ['timeline', 'transforms', 'batches', 'compositing'],
  },
  {
    id: 'math',
    title: '数学与空间',
    intro: '公式、线性代数、函数曲线、坐标空间与运动学。',
    ids: ['math', 'kinematics', 'infinite', 'interactive-linear'],
  },
  {
    id: 'advanced',
    title: '高级可视化',
    intro: '分形、傅里叶、复映射、电场与神经网络等复杂场景。',
    ids: ['fourier', 'hilbert', 'fractals', 'modular', 'bezier', 'mandelbrot', 'complex', 'electric-field', 'neural-network', 'neural-forward-demo', 'neural-forward'],
  },
  {
    id: 'algorithms',
    title: '算法与模拟',
    intro: '真实算法 trace 与确定性模拟状态，而不是预先录制的视频。',
    ids: ['sorting', 'red-black-tree', 'collisions'],
  },
  {
    id: 'three-d',
    title: '3D',
    intro: 'Zig/WASM 深度光栅化、3D mesh、相机和层级变换。',
    ids: ['three-d', 'rubiks-cube'],
  },
  {
    id: 'janim',
    title: 'JAnim',
    intro: '这一组示例来自对 JAnim 公开示例效果的重新实现。感谢 JAnim 项目在动画 API、效果设计和示例组织方面给 Zanim 提供的参考与启发。',
    ids: Object.keys(janimZh),
  },
]

const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]))

export const galleryItems = galleryGroups.flatMap((group) =>
  group.ids.map((id) => {
    const scene = sceneMap.get(id)
    if (!scene) throw new Error(`gallery scene not found: ${id}`)
    const [titleZh, description, refs] = zh[id] ?? [...(janimZh[id] ?? [scene.title, 'JAnim 示例效果复刻。']), ['JAnim', '@zanim/web']]
    return {
      ...scene,
      category: group.id,
      categoryTitle: group.title,
      titleZh,
      description,
      note: noteZh[id] ?? '',
      references: refs ?? ['JAnim', '@zanim/web'],
    }
  }),
)

export const galleryById = new Map(galleryItems.map((item) => [item.id, item]))

export function categoryItems(groupId) {
  return galleryItems.filter((item) => item.category === groupId)
}
