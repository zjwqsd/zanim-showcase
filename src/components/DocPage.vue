<script setup>
import CodeTabs from './CodeTabs.vue'
import LiveScene from './LiveScene.vue'
import { scenes } from '../scenes/index.js'
import { javascriptSource, pythonSource } from '../docs/sources.js'

defineProps({
  page: { type: Object, required: true },
  navigate: { type: Function, required: true },
})

const sceneById = new Map(scenes.map((item) => [item.id, item]))

function isExternal(url) {
  return /^https?:\/\//.test(url)
}

function sceneItem(id) {
  return sceneById.get(id) ?? null
}
</script>

<template>
  <article class="docs-article">
    <h1>{{ page.title }}</h1>
    <p v-if="page.lead" class="lead">{{ page.lead }}</p>

    <section v-for="section in page.sections" :id="section.id" :key="section.id" class="doc-section">
      <h2>
        <span class="heading-anchor" aria-hidden="true">#</span>
        {{ section.title }}
      </h2>

      <p v-for="paragraph in section.paragraphs ?? []" :key="paragraph">{{ paragraph }}</p>

      <ul v-if="section.bullets" class="doc-list">
        <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
      </ul>

      <div v-if="section.links" class="doc-links">
        <template v-for="[url, label] in section.links" :key="url">
          <a v-if="isExternal(url)" :href="url" target="_blank" rel="noreferrer">{{ label }}</a>
          <a v-else href="#" @click.prevent="navigate(url)">{{ label }}</a>
        </template>
      </div>

      <CodeTabs
        v-if="section.code"
        :python="section.code.python"
        :js="section.code.js"
      />

      <CodeTabs
        v-if="section.shell"
        :shell="section.shell"
        max-height="18rem"
      />

      <template v-if="section.demo && sceneItem(section.demo)">
        <div class="tutorial-demo-head">
          <span :class="['tutorial-demo-badge', sceneItem(section.demo).static ? 'is-static' : 'is-timeline']">
            {{ sceneItem(section.demo).static ? '静态 Scene · 无时间线' : '时间轴示例' }}
          </span>
          <span>{{ sceneItem(section.demo).title }}</span>
        </div>

        <LiveScene :item="sceneItem(section.demo)" compact />

        <CodeTabs
          v-if="section.demoCode !== false"
          :python="pythonSource(sceneItem(section.demo))"
          :js="javascriptSource(sceneItem(section.demo))"
          max-height="30rem"
        />
      </template>

      <LiveScene
        v-else-if="section.scene && sceneItem(section.scene)"
        :item="sceneItem(section.scene)"
        compact
      />

      <table v-if="section.table" class="doc-table">
        <tbody>
          <tr v-for="[key, value] in section.table" :key="key">
            <th>{{ key }}</th>
            <td><code>{{ value }}</code></td>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
</template>
