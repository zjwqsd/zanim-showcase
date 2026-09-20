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
let scene = null
let observer = null
let raf = 0
let visible = false

async function build() {
  if (props.item.interactive || scene || loading.value || !canvas.value) return
  loading.value = true
  error.value = ''
  try {
    await nextTick()
    scene = await props.item.builder(canvas.value)
    duration.value = scene.duration
    scene.seek(0)
    if (visible && props.autoplay) {
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

function tick() {
  if (scene) currentTime.value = scene.time
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  observer = new IntersectionObserver(async ([entry]) => {
    visible = entry.isIntersecting
    if (entry.isIntersecting) {
      await build()
      if (scene && props.autoplay && !playing.value) {
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
  scene?.destroy()
})
</script>

<template>
  <div ref="root" class="live-scene" :class="{ compact }">
    <InteractiveLinearAlgebra v-if="item.interactive === 'linear-algebra'" />

    <template v-else>
      <div class="live-stage" :style="{ aspectRatio: item.width + ' / ' + item.height }">
        <canvas ref="canvas"></canvas>
        <div v-if="!scene && !error" class="live-overlay">
          <span v-if="loading" class="docs-spinner"></span>
          <span>{{ loading ? '正在构建 Zanim Scene…' : '滚动到此处后加载' }}</span>
        </div>
        <div v-if="error" class="live-overlay error">
          <strong>Scene 构建失败</strong>
          <pre>{{ error }}</pre>
        </div>
      </div>

      <div class="live-controls">
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
      </div>
    </template>
  </div>
</template>
