import { DynamicVectorObject2D, Easing, Math as ZMath, prepareVectorMorph } from '@zanim/web'
const clamp01 = (x) => globalThis.Math.max(0, globalThis.Math.min(1, x))
export async function createDynamicMatrixProduct({ transform, zIndex = 9 } = {}) {
  const formulas = [
    new ZMath('mat(-3, 3; 0, 3) times mat(4, 0; 0, -2) = mat(-12, -6; 0, -6)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(3, -3; 1, 4) times mat(0, -2; 3, -3) = mat(-9, 3; 12, -14)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(1, -2; 3, -1) times mat(0, -2; 0, 2) = mat(0, -6; 0, -8)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(1, 1; 1, 2) times mat(-4, 4; 1, 3) = mat(-3, 7; -2, 10)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(4, 0; 3, 0) times mat(-1, 0; 0, 3) = mat(-4, 0; -3, 0)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(2, -3; -4, 0) times mat(-3, 1; -4, -1) = mat(6, 5; 12, -4)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(-1, -2; 4, 2) times mat(4, -2; -3, -4) = mat(2, 10; 10, -16)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(0, -1; 4, -1) times mat(1, -2; 1, -2) = mat(-1, 2; 3, -6)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(-3, -3; 2, -1) times mat(1, 4; -2, -4) = mat(3, 0; 4, 12)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(2, 0; 1, 0) times mat(2, -4; 4, 1) = mat(4, -8; 2, -4)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(-2, -4; 4, 0) times mat(-2, -2; -3, 1) = mat(16, 0; -8, -8)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(-3, -2; -4, 2) times mat(-1, 4; -2, 0) = mat(7, -12; 0, -16)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(1, 3; 0, -1) times mat(3, -1; 3, 3) = mat(12, 8; -3, -3)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(-1, -1; 3, 0) times mat(1, 2; 0, 1) = mat(-1, -3; 3, 6)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(2, -1; -1, 3) times mat(4, -1; 2, -2) = mat(6, 0; 2, -5)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(3, 4; 4, 1) times mat(0, -2; -1, 2) = mat(-4, 2; -1, -6)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(4, 0; 0, -2) times mat(-2, 3; 0, 3) = mat(-8, 12; 0, -6)', { fontSize: 31, color: '#eef2fa' }),
    new ZMath('mat(3, 2; 2, 2) times mat(1, 3; 3, -2) = mat(9, 5; 8, 2)', { fontSize: 31, color: '#eef2fa' }),
  ]
  await Promise.all(formulas.map((formula) => formula.ready))
  const documents = formulas.map((formula) => formula.document)
  const morphs = documents.slice(0, -1).map((document, i) => prepareVectorMorph(document, documents[i + 1]))
  return new DynamicVectorObject2D((time) => {
    const raw = globalThis.Math.max(0, time - 0.4) * 3
    const index = globalThis.Math.min(documents.length - 1, globalThis.Math.floor(raw))
    if (index >= documents.length - 1) return documents.at(-1)
    const phase = raw - index
    const alpha = Easing.SMOOTHSTEP(clamp01(phase / 0.55))
    return morphs[index].sample(alpha)
  }, { transform, zIndex })
}
