<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { deferred, scenes } from './scenes/index.js'
import InteractiveLinearAlgebra from './components/InteractiveLinearAlgebra.vue'

const canvas = ref(null)
const activeId = ref(scenes[0].id)
const loading = ref(false)
const error = ref('')
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
let currentScene = null
let raf = 0

const active = computed(() => scenes.find((item) => item.id === activeId.value) ?? scenes[0])
const aspect = computed(() => `${active.value.width} / ${active.value.height}`)
const progress = computed(() => duration.value > 0 ? currentTime.value / duration.value : 0)

async function loadScene(id) {
  if (loading.value && id === activeId.value) return
  activeId.value = id
  loading.value = true
  playing.value = false
  error.value = ''
  currentTime.value = 0
  duration.value = 0
  if (currentScene) {
    currentScene.destroy()
    currentScene = null
  }
  await nextTick()
  try {
    const item = scenes.find((entry) => entry.id === id)
    if (item.interactive) return
    currentScene = await item.builder(canvas.value)
    duration.value = currentScene.duration
    currentScene.seek(0)
  } catch (err) {
    console.error(err)
    error.value = err?.stack || String(err)
  } finally {
    loading.value = false
  }
}

function togglePlay() {
  if (!currentScene || loading.value) return
  if (playing.value) {
    currentScene.pause()
    playing.value = false
  } else {
    if (currentScene.time >= currentScene.duration - 1e-4) currentScene.seek(0)
    currentScene.play({ loop: true, from: currentScene.time })
    playing.value = true
  }
}

function restart() {
  if (!currentScene) return
  currentScene.pause()
  currentScene.seek(0)
  currentTime.value = 0
  playing.value = false
}

function seek(event) {
  if (!currentScene) return
  const t = Number(event.target.value)
  currentScene.seek(t)
  currentTime.value = t
}

function tick() {
  if (currentScene) currentTime.value = currentScene.time
  raf = requestAnimationFrame(tick)
}

onMounted(async () => {
  await loadScene(activeId.value)
  tick()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  currentScene?.destroy()
})
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="mark">Z</div>
        <div>
          <strong>Zanim Web Study</strong>
          <span>Vue + Vite downstream project</span>
        </div>
      </div>

      <div class="summary">
        <strong>{{ scenes.length }}</strong>
        <span>semantic ports</span>
        <i></i>
        <strong>{{ deferred.length }}</strong>
        <span>deferred</span>
      </div>

      <nav class="scene-list">
        <button
          v-for="item in scenes"
          :key="item.id"
          :class="{ active: item.id === activeId }"
          @click="loadScene(item.id)"
        >
          <span class="scene-index">{{ String(scenes.indexOf(item) + 1).padStart(2, '0') }}</span>
          <span class="scene-copy">
            <strong>{{ item.title }}</strong>
            <small>{{ item.source }}</small>
          </span>
        </button>
      </nav>

      <details class="deferred">
        <summary>Deferred on purpose</summary>
        <div v-for="([name, reason]) in deferred" :key="name" class="deferred-item">
          <strong>{{ name }}</strong>
          <span>{{ reason }}</span>
        </div>
      </details>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <p>{{ active.interactive ? 'Zanim Web interaction lab' : 'Python example → TypeScript authoring' }}</p>
          <h1>{{ active.title }}</h1>
        </div>
        <div class="badges">
          <span>{{ active.interactive ? 'pointer-driven' : 'public API only' }}</span>
          <span>{{ active.interactive ? 'retained Scene' : '@zanim/web 0.0.2' }}</span>
        </div>
      </header>

      <InteractiveLinearAlgebra v-if="active.interactive === 'linear-algebra'" />

      <template v-else>
        <section class="stage-card">
          <div class="stage" :style="{ aspectRatio: aspect }">
            <canvas ref="canvas"></canvas>
            <div v-if="loading" class="overlay"><div class="spinner"></div><span>building scene</span></div>
            <div v-if="error" class="overlay error"><strong>Scene failed</strong><pre>{{ error }}</pre></div>
          </div>

          <div class="controls">
            <button class="play" :disabled="loading || !!error" @click="togglePlay">
              {{ playing ? 'Pause' : 'Play' }}
            </button>
            <button class="restart" :disabled="loading || !!error" @click="restart">Restart</button>
            <input
              type="range"
              min="0"
              :max="Math.max(duration, 0.001)"
              step="0.001"
              :value="currentTime"
              :disabled="loading || !!error"
              @input="seek"
            />
            <span class="time">{{ currentTime.toFixed(2) }} / {{ duration.toFixed(2) }} s</span>
          </div>
          <div class="progress"><i :style="{ width: `${progress * 100}%` }"></i></div>
        </section>

        <section class="info-grid">
          <article>
            <span>Reference</span>
            <strong>{{ active.source }}</strong>
            <p>The TypeScript scene was reconstructed from the Python example's authored objects, timeline offsets, durations, coordinate frames and procedural formulas.</p>
          </article>
          <article>
            <span>Canvas</span>
            <strong>{{ active.width }} × {{ active.height }}</strong>
            <p>World scale follows the Python canvas ratio. The browser canvas is responsive while preserving the scene aspect ratio.</p>
          </article>
          <article>
            <span>Policy</span>
            <strong>No frontend demo source reused</strong>
            <p>Only the installed package API and Python examples are used as references. Unsupported scenes stay deferred instead of being approximated cosmetically.</p>
          </article>
          <article v-if="active.note">
            <span>Implementation note</span>
            <strong>Static-site constraint</strong>
            <p>{{ active.note }}</p>
          </article>
        </section>
      </template>
    </main>
  </div>
</template>
