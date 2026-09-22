import interactiveLinearSource from '../components/InteractiveLinearAlgebra.vue?raw'

const pythonModules = import.meta.glob('../../examples/**/*.py', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const webModules = import.meta.glob('../scenes/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function sourceParts(item) {
  const [file, selector = ''] = String(item.source ?? '').split(' · ').map((part) => part.trim())
  return { file: file.endsWith('.py') ? file : null, selector }
}

function sourcePath(item) {
  return sourceParts(item).file
}

function stripPythonImports(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let skippingImportBlock = false
  let parenDepth = 0

  for (const line of lines) {
    const trimmed = line.trim()

    if (!skippingImportBlock && (trimmed.startsWith('from ') || trimmed.startsWith('import '))) {
      const opens = (line.match(/\(/g) ?? []).length
      const closes = (line.match(/\)/g) ?? []).length
      parenDepth = opens - closes
      skippingImportBlock = parenDepth > 0
      continue
    }

    if (skippingImportBlock) {
      parenDepth += (line.match(/\(/g) ?? []).length
      parenDepth -= (line.match(/\)/g) ?? []).length
      if (parenDepth <= 0) {
        skippingImportBlock = false
        parenDepth = 0
      }
      continue
    }

    if (/^if __name__\s*==\s*['"]__main__['"]\s*:/.test(trimmed)) break
    out.push(line)
  }

  return out.join('\n').replace(/^\s*\n+/, '').replace(/\n{3,}/g, '\n\n').trim()
}

function extractPythonFunction(source, functionName) {
  if (!functionName) return null
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const escaped = functionName.replace(/[.*+?^$()|[\]\\]/g, '\\$&')
  const start = lines.findIndex((line) => new RegExp(`^def\\s+${escaped}\\b`).test(line))
  if (start < 0) return null

  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() && !/^\s/.test(line) && !line.trim().startsWith('#')) {
      end = i
      break
    }
  }
  return lines.slice(start, end).join('\n').trimEnd()
}

function extractPythonClass(source, className) {
  if (!className) return null
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const start = lines.findIndex((line) => new RegExp(`^class\\s+${className.replace(/[.*+?^${\}()|[\\]\\]/g, '\\$&')}\\b`).test(line))
  if (start < 0) return null

  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() && !/^\s/.test(line) && !line.trim().startsWith('#')) {
      end = i
      break
    }
  }
  return lines.slice(start, end).join('\n').trimEnd()
}

function cleanPythonSource(source, selector = '') {
  const standardImports = source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      if (!(trimmed.startsWith('from ') || trimmed.startsWith('import '))) return false
      return !trimmed.includes('zanim') && !trimmed.startsWith('from __future__')
    })
    .join('\n')

  let clean = stripPythonImports(source)
  clean = clean.replace(/^\s*(?:"""[\s\S]*?"""|'''[\s\S]*?''')\s*/, '')
  const classMatches = [...clean.matchAll(/^class\s+(\w+)\b/gm)]
  const prefix = [standardImports, 'from zanim import *'].filter(Boolean).join('\n')

  if (selector) {
    if (classMatches.length === 1) return `${prefix}\n\n${clean}`
    const selected = extractPythonClass(clean, selector)
    if (selected) return `${prefix}\n\n${selected}`
  }

  if (classMatches.length === 1) return `${prefix}\n\n${clean}`
  return `${prefix}\n\n${clean}`
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${\}()|[\]\\]/g, '\\$&')
}

function moduleForItem(item) {
  const idPattern = new RegExp(`id\\s*:\\s*['"]${escapeRegex(item.id)}['"]`)
  for (const [path, source] of Object.entries(webModules)) {
    if (idPattern.test(source)) return { path, source }
  }
  return null
}

function builderNameFromModule(source, id) {
  const escaped = escapeRegex(id)
  const patterns = [
    new RegExp(`\\{[^\\n]*id\\s*:\\s*['"]${escaped}['"][^\\n]*builder\\s*:\\s*(\\w+)`),
    new RegExp(`id\\s*:\\s*['"]${escaped}['"][\\s\\S]{0,500}?builder\\s*:\\s*(\\w+)`),
  ]
  for (const pattern of patterns) {
    const match = source.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractJavascriptFunction(source, name) {
  if (!name) return null
  const signature = new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${escapeRegex(name)}\\s*\\(`)
  const match = signature.exec(source)
  if (!match) return null

  const start = match.index
  const brace = source.indexOf('{', start)
  if (brace < 0) return null

  let depth = 0
  let quote = null
  let escaped = false
  let lineComment = false
  let blockComment = false
  let templateExprDepth = 0

  for (let i = brace; i < source.length; i++) {
    const ch = source[i]
    const next = source[i + 1]

    if (lineComment) {
      if (ch === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false
        i++
      }
      continue
    }
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (quote === '`' && ch === '$' && next === '{') {
        templateExprDepth++
        i++
        continue
      }
      if (quote === '`' && ch === '}' && templateExprDepth > 0) {
        templateExprDepth--
        continue
      }
      if (ch === quote && templateExprDepth === 0) quote = null
      continue
    }

    if (ch === '/' && next === '/') {
      lineComment = true
      i++
      continue
    }
    if (ch === '/' && next === '*') {
      blockComment = true
      i++
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) return source.slice(start, i + 1).trim()
    }
  }
  return null
}

export function pythonSource(item) {
  const { file, selector } = sourceParts(item)
  if (file) {
    const key = `../../examples/${file}`
    if (pythonModules[key]) return cleanPythonSource(pythonModules[key], selector)
  }
  if (item.id === 'interactive-linear') {
    return `from zanim import InfiniteGrid, Scene, Transform2D

scene = Scene()
grid = scene.add(InfiniteGrid(step=0.5))

grid.transform_function(
    lambda a: Transform2D.rotation(0.6 * a)
        @ Transform2D.shear(0.8 * a),
    duration=3.0,
)

scene.preview()`
  }
  return ''
}

export function javascriptSource(item) {
  if (item.id === 'interactive-linear') return interactiveLinearSource

  const module = moduleForItem(item)
  if (module) {
    const builderName = builderNameFromModule(module.source, item.id)
    const source = extractJavascriptFunction(module.source, builderName)
    if (source) {
      return `// import 与共享辅助函数已省略；下方链接可查看完整 Web 文件。\n\n${source}`
    }
  }

  return '// 未能从原始源码中定位该 Gallery builder。'
}

export function janimPortPythonSource(item) {
  const { file, selector } = sourceParts(item)
  if (!file) return pythonSource(item)

  const key = '../../examples/' + file
  const raw = pythonModules[key]
  if (!raw) return pythonSource(item)

  const selected = extractPythonClass(raw, selector)
  if (!selected) {
    return 'from zanim import *\n\n# import / 共享辅助函数已省略；完整文件可从下方链接打开。\n\n' + stripPythonImports(raw)
  }

  return 'from zanim import *\n\n# 共享辅助类与函数位于完整源文件中；这里展示 Scene 本体。\n\n' + selected
}

export function manimPortPythonSource(item) {
  const { file, selector } = sourceParts(item)
  if (!file) return pythonSource(item)

  const key = `../../examples/${file}`
  const raw = pythonModules[key]
  if (!raw) return pythonSource(item)

  const selected = extractPythonClass(raw, selector)
  if (!selected) return `from zanim import *

${stripPythonImports(raw)}`

  if (item.id === 'manim-point-shapes') {
    const helper = extractPythonFunction(raw, 'Rotating')
    return `from zanim import *

# 仅用于 Manim 对照页；Rotating 不属于 Zanim 公共 API。
${helper ?? ''}

${selected}`
  }

  return `from zanim import *

${selected}`
}

export function githubPythonUrl(item) {
  const path = sourcePath(item)
  if (!path) return null
  return `https://github.com/zjwqsd/zanim-showcase/blob/main/examples/${path}`
}

export function githubWebUrl(item) {
  const module = moduleForItem(item)
  if (!module) return 'https://github.com/zjwqsd/zanim-showcase/tree/main/src/scenes'
  const filename = module.path.split('/').at(-1)
  return `https://github.com/zjwqsd/zanim-showcase/blob/main/src/scenes/${filename}`
}
