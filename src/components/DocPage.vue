<script setup>
import CodeTabs from './CodeTabs.vue'
import LiveScene from './LiveScene.vue'
import { galleryById } from '../docs/catalog.js'

defineProps({
  page: { type: Object, required: true },
  navigate: { type: Function, required: true },
})

function isExternal(url) {
  return /^https?:\/\//.test(url)
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

      <LiveScene
        v-if="section.scene && galleryById.get(section.scene)"
        :item="galleryById.get(section.scene)"
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
