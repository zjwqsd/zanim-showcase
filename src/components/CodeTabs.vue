<script setup>
import { computed, ref } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-python.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-bash.js'

const props = defineProps({
  python: { type: String, default: '' },
  js: { type: String, default: '' },
  shell: { type: String, default: '' },
  maxHeight: { type: String, default: '34rem' },
})

const initial = props.python ? 'python' : props.js ? 'javascript' : 'bash'
const active = ref(initial)
const copied = ref(false)

const tabs = computed(() => [
  props.python ? ['python', 'Python'] : null,
  props.js ? ['javascript', 'JavaScript'] : null,
  props.shell ? ['bash', 'Shell'] : null,
].filter(Boolean))

const source = computed(() => active.value === 'python' ? props.python : active.value === 'javascript' ? props.js : props.shell)
const highlighted = computed(() => Prism.highlight(source.value, Prism.languages[active.value], active.value))

async function copy() {
  await navigator.clipboard.writeText(source.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1100)
}
</script>

<template>
  <div class="code-tabs-block">
    <div v-if="tabs.length > 1" class="code-tabs-head">
      <div class="code-tab-buttons">
        <button
          v-for="[key, label] in tabs"
          :key="key"
          :class="{ active: active === key }"
          @click="active = key"
        >{{ label }}</button>
      </div>
      <button class="copy-code" @click="copy">{{ copied ? '已复制' : '复制' }}</button>
    </div>
    <div v-else class="code-tabs-head single">
      <span>{{ tabs[0]?.[1] ?? 'Code' }}</span>
      <button class="copy-code" @click="copy">{{ copied ? '已复制' : '复制' }}</button>
    </div>
    <pre :style="{ maxHeight }"><code :class="'language-' + active" v-html="highlighted"></code></pre>
  </div>
</template>
