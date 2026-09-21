<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import InteractiveLinearAlgebra from './InteractiveLinearAlgebra.vue'

const props = defineProps({
  item: { type: Object, required: true },
  autoplay: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
})

const root = ref(null)
const canvas = ref(null)
const loading = ref(false)
const error = ref('')
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const muted = ref(true)
const orbiting = ref(false)
let scene = null
let observer = null
let raf = 0
let visible = false
let orbitPointerId = null
let orbitLastX = 0
let orbitLastY = 0

async function build() {
  if (props.item.interactive || scene || loading.value || !canvas.value) return
  loading.value = true
  error.value = ''
  try {
    await nextTick()
    scene = await props.item.builder(canvas.value)
    duration.value = scene.duration
    scene.seek(0)
    applyMuted(true)
    if (!props.item.static && visible && props.autoplay) {
      scene.play({ loop: true, from: 0 })
      playing.value = true
    }
  } catch (err) {
    console.error(err)
    error.value = err?.stack || String(err)
  } finally {
    loading.value = false
  }
}

function applyMuted(value) {
  muted.value = value
  if (!scene) return
  for (const object of scene.objects ?? []) {
    if (object?._mediaKind === 'audio') {
      if (object.__galleryGain == null) object.__galleryGain = object.gain
      object.gain = value ? 0 : object.__galleryGain
      if (object._element) object._element.muted = value
    } else if (object?._mediaKind === 'video' && object._element) {
      object._element.muted = value
    }
  }
}

function toggleMuted() { applyMuted(!muted.value) }

function playPause() {
  if (!scene || loading.value || error.value) return
  if (playing.value) {
    scene.pause()
    playing.value = false
  } else {
    if (scene.time >= scene.duration - 1e-4) scene.seek(0)
    scene.play({ loop: true, from: scene.time })
    playing.value = true
  }
}

function restart() {
  if (!scene) return
  scene.pause()
  scene.seek(0)
  currentTime.value = 0
  if (visible && props.autoplay) {
    scene.play({ loop: true, from: 0 })
    playing.value = true
  } else {
    playing.value = false
  }
}

function seek(event) {
  if (!scene) return
  const t = Number(event.target.value)
  scene.pause()
  scene.seek(t)
  currentTime.value = t
  playing.value = false
}

function orbitCamera() {
  if (!props.item.orbit3d || !scene) return null
  return scene.interactiveCamera3D ?? null
}

function onOrbitPointerDown(event) {
  if (event.button !== 2) return
  const camera3d = orbitCamera()
  if (!camera3d) return
  event.preventDefault()
  orbitPointerId = event.pointerId
  orbitLastX = event.clientX
  orbitLastY = event.clientY
  orbiting.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function onOrbitPointerMove(event) {
  if (orbitPointerId == null || event.pointerId !== orbitPointerId) return
  const camera3d = orbitCamera()
  if (!camera3d) return
  const dx = event.clientX - orbitLastX
  const dy = event.clientY - orbitLastY
  orbitLastX = event.clientX
  orbitLastY = event.clientY
  camera3d.orbitBy(-dx * .0065, dy * .0065)
  scene.render()
}

function endOrbit(event) {
  if (orbitPointerId == null || (event.pointerId != null && event.pointerId !== orbitPointerId)) return
  try { event.currentTarget?.releasePointerCapture?.(orbitPointerId) } catch {}
  orbitPointerId = null
  orbiting.value = false
}

function onOrbitWheel(event) {
  const camera3d = orbitCamera()
  if (!camera3d) return
  event.preventDefault()
  camera3d.zoomBy(Math.exp(event.deltaY * .0012))
  scene.render()
}

function resetOrbit(event = null) {
  const camera3d = orbitCamera()
  if (!camera3d) return
  event?.preventDefault?.()
  camera3d.resetViewOverride()
  scene.render()
}

function onContextMenu(event) {
  if (orbitCamera()) event.preventDefault()
}

function tick() {
  if (scene) currentTime.value = scene.time
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  observer = new IntersectionObserver(async ([entry]) => {
    visible = entry.isIntersecting
    if (entry.isIntersecting) {
      await build()
      if (scene && !props.item.static && props.autoplay && !playing.value) {
        scene.play({ loop: true, from: scene.time })
        playing.value = true
      }
    } else if (scene && playing.value) {
      scene.pause()
      playing.value = false
    }
  }, { rootMargin: '420px 0px', threshold: 0.03 })
  observer.observe(root.value)
  tick()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(raf)
  orbitPointerId = null
  scene?.destroy()
})
</script>

<template>
  <div ref="root" class="live-scene" :class="{ compact }">
    <InteractiveLinearAlgebra v-if="item.interactive === 'linear-algebra'" />

    <template v-else>
      <div
        class="live-stage"
        :class="{ orbitable: item.orbit3d, orbiting }"
        :style="{ aspectRatio: item.width + ' / ' + item.height }"
      >
        <canvas
          ref="canvas"
          @pointerdown="onOrbitPointerDown"
          @pointermove="onOrbitPointerMove"
          @pointerup="endOrbit"
          @pointercancel="endOrbit"
          @lostpointercapture="endOrbit"
          @wheel="onOrbitWheel"
          @dblclick="resetOrbit"
          @contextmenu="onContextMenu"
        ></canvas>
        <div v-if="item.orbit3d && scene && !error" class="orbit-hint">
          右键拖动视角 · 滚轮缩放 · 双击复位
        </div>
        <div v-if="!scene && !error" class="live-overlay">
          <span v-if="loading" class="docs-spinner"></span>
          <span>{{ loading ? '正在构建 Zanim Scene…' : '滚动到此处后加载' }}</span>
        </div>
        <div v-if="error" class="live-overlay error">
          <strong>Scene 构建失败</strong>
          <pre>{{ error }}</pre>
        </div>
      </div>

      <div v-if="!item.static" class="live-controls">
        <button :disabled="!scene || !!error" @click="playPause">{{ playing ? '暂停' : '播放' }}</button>
        <button :disabled="!scene || !!error" @click="restart">重播</button>
        <input
          type="range"
          min="0"
          :max="Math.max(duration, .001)"
          step=".001"
          :value="currentTime"
          :disabled="!scene || !!error"
          @input="seek"
        />
        <span>{{ currentTime.toFixed(2) }} / {{ duration.toFixed(2) }} s</span>
        <button v-if="item.hasAudio" :disabled="!scene || !!error" @click="toggleMuted">{{ muted ? '开启声音' : '静音' }}</button>
      </div>
    </template>
  </div>
</template>
