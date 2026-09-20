import interactiveLinearSource from '../components/InteractiveLinearAlgebra.vue?raw'

const pythonModules = import.meta.glob('../../examples/**/*.py', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function sourcePath(item) {
  const first = String(item.source ?? '').split(' · ')[0]
  return first.endsWith('.py') ? first : null
}

export function pythonSource(item) {
  const path = sourcePath(item)
  if (path) {
    const key = `../../examples/${path}`
    if (pythonModules[key]) return pythonModules[key]
  }
  if (item.id === 'interactive-linear') {
    return `from zanim import InfiniteGrid, InfiniteLine, Scene, Transform2D

# Web 版本由 pointer 直接更新 retained Scene。
# Python 中同一套几何对象仍然可放进时间轴或交互 preview。
scene = Scene()
grid = scene.add(InfiniteGrid(step=0.5))

grid.transform_function(
    lambda a: Transform2D.rotation(0.6 * a)
        @ Transform2D.shear(0.8 * a),
    duration=3.0,
)

scene.preview()`
  }
  return '# 该条目没有独立 Python 文件。'
}

export function javascriptSource(item) {
  if (item.id === 'interactive-linear') return interactiveLinearSource
  if (typeof item.builder === 'function') {
    return `// 这是 Gallery 实际调用的 Web builder。\n// 同文件中的辅助函数会被该 builder 复用。\n\n${item.builder.toString()}`
  }
  return '// 该条目没有独立 JavaScript builder。'
}

export function githubPythonUrl(item) {
  const path = sourcePath(item)
  if (!path) return null
  return `https://github.com/zjwqsd/zanim-showcase/blob/main/examples/${path}`
}

export function githubWebUrl(item) {
  if (item.category === 'janim') {
    return 'https://github.com/zjwqsd/zanim-showcase/blob/main/src/scenes/janim.js'
  }
  if (['electric-field', 'neural-network', 'sorting', 'red-black-tree', 'collisions'].includes(item.id)) {
    return 'https://github.com/zjwqsd/zanim-showcase/blob/main/src/scenes/derived2d.js'
  }
  if (['compositing', 'three-d', 'rubiks-cube'].includes(item.id)) {
    return 'https://github.com/zjwqsd/zanim-showcase/blob/main/src/scenes/advanced.js'
  }
  if (['neural-forward', 'neural-forward-demo'].includes(item.id)) {
    return 'https://github.com/zjwqsd/zanim-showcase/blob/main/src/scenes/neuralForwardPass.js'
  }
  if (item.id === 'interactive-linear') {
    return 'https://github.com/zjwqsd/zanim-showcase/blob/main/src/components/InteractiveLinearAlgebra.vue'
  }
  return 'https://github.com/zjwqsd/zanim-showcase/blob/main/src/scenes/index.js'
}
