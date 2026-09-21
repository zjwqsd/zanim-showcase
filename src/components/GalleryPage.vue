<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { categoryItems, galleryCollections } from '../docs/catalog.js'
import GalleryExample from './GalleryExample.vue'

defineProps({
  onNavigate: { type: Function, default: null },
})

const activeCollection = ref(galleryCollections[0]?.id ?? 'zanim')
const currentCollection = computed(() =>
  galleryCollections.find((collection) => collection.id === activeCollection.value) ?? galleryCollections[0],
)

function collectionForAnchor(anchor) {
  if (!anchor) return null
  if (anchor.startsWith('collection-')) {
    return galleryCollections.find((collection) => collection.id === anchor.slice('collection-'.length)) ?? null
  }
  return galleryCollections.find((collection) =>
    collection.groups.some((group) => group.id === anchor || group.ids.includes(anchor)),
  ) ?? null
}

function syncCollectionFromHash() {
  const anchor = location.hash.split('#')[2] ?? ''
  const collection = collectionForAnchor(anchor)
  if (collection) activeCollection.value = collection.id
}

function selectCollection(id) {
  activeCollection.value = id
  location.hash = '/gallery#collection-' + id
}

onMounted(() => {
  syncCollectionFromHash()
  addEventListener('hashchange', syncCollectionFromHash)
})

onBeforeUnmount(() => removeEventListener('hashchange', syncCollectionFromHash))
</script>

<template>
  <article class="docs-article gallery-page">
    <h1>Example Gallery</h1>
    <p class="lead">
      Gallery 只保留 Zanim 自己的原生示例；Manim 与 JAnim 的复刻对照已经迁移到独立页面。
      所有网页结果都直接运行真实 <code>@zanim/web</code> Scene，可播放、暂停与 seek。
    </p>

    <div class="admonition tip">
      <div class="admonition-title">代码阅读</div>
      <p>
        页面只展示场景主体：重复 import、共享辅助函数与 CLI 输出入口会被折叠。
        下方“完整源文件”链接仍指向仓库中的可运行源码。
      </p>
    </div>

    <nav class="gallery-collection-nav" aria-label="Gallery collections">
      <a
        v-for="collection in galleryCollections"
        :key="collection.id"
        :href="'#/gallery#collection-' + collection.id"
        :class="{ active: activeCollection === collection.id }"
        @click.prevent="selectCollection(collection.id)"
      >
        <div>
          <strong>{{ collection.title }}</strong>
          <p>{{ collection.intro }}</p>
        </div>
        <span>{{ collection.groups.reduce((sum, group) => sum + group.ids.length, 0) }} examples</span>
      </a>
    </nav>

    <section
      v-if="currentCollection"
      :id="'collection-' + currentCollection.id"
      :key="currentCollection.id"
      class="gallery-collection"
    >
      <header class="gallery-collection-head">
        <div class="gallery-collection-kicker">Collection</div>
        <h2>{{ currentCollection.title }}</h2>
        <p>{{ currentCollection.intro }}</p>
      </header>

      <nav class="gallery-jump">
        <strong>本集合</strong>
        <a v-for="group in currentCollection.groups" :key="group.id" :href="'#/gallery#' + group.id">
          {{ group.title }}
        </a>
      </nav>

      <section
        v-for="group in currentCollection.groups"
        :id="group.id"
        :key="group.id"
        class="gallery-group"
      >
        <h3 class="gallery-group-title">
          <span class="heading-anchor" aria-hidden="true">#</span>
          {{ group.title }}
        </h3>
        <p>{{ group.intro }}</p>

        <GalleryExample
          v-for="item in categoryItems(group.id)"
          :key="item.id"
          :item="item"
        />
      </section>
    </section>
  </article>
</template>
