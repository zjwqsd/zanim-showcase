<script setup>
import { ref } from 'vue'
import CodeTabs from './CodeTabs.vue'
import LiveScene from './LiveScene.vue'
import { githubPythonUrl, githubWebUrl, javascriptSource, pythonSource } from '../docs/sources.js'

defineProps({ item: { type: Object, required: true } })

const sourceOpen = ref(false)
</script>

<template>
  <article :id="item.id" class="gallery-example">
    <h4>
      <span class="heading-anchor" aria-hidden="true">#</span>
      {{ item.titleZh }}
    </h4>
    <p class="gallery-description">{{ item.description }}</p>

    <LiveScene :item="item" />

    <div v-if="item.note" class="admonition note">
      <div class="admonition-title">说明</div>
      <p>{{ item.note }}</p>
    </div>

    <div class="gallery-example-actions">
      <button class="gallery-source-toggle" @click="sourceOpen = !sourceOpen">
        {{ sourceOpen ? '收起代码' : '查看代码' }}
      </button>

      <p class="example-source-links">
        <a v-if="item.upstreamUrl" :href="item.upstreamUrl" target="_blank" rel="noreferrer">官方示例 ↗</a>
        <a v-if="githubPythonUrl(item)" :href="githubPythonUrl(item)" target="_blank" rel="noreferrer">完整 Python 源文件 ↗</a>
        <a :href="githubWebUrl(item)" target="_blank" rel="noreferrer">完整 Web 源文件 ↗</a>
      </p>
    </div>

    <CodeTabs
      v-if="sourceOpen"
      :python="pythonSource(item)"
      :js="javascriptSource(item)"
      max-height="36rem"
    />

    <p class="references">
      <strong>参考：</strong>
      <code v-for="ref in item.references" :key="ref">{{ ref }}</code>
    </p>
  </article>
</template>
