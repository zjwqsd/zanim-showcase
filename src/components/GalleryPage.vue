<script setup>
import { categoryItems, galleryCollections } from '../docs/catalog.js'
import GalleryExample from './GalleryExample.vue'

defineProps({
  onNavigate: { type: Function, default: null },
})
</script>

<template>
  <article class="docs-article gallery-page">
    <h1>Example Gallery</h1>
    <p class="lead">
      Gallery 分为三个独立集合：Zanim 原生示例、Manim 官方 Example Gallery 复刻、JAnim 示例复刻。
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
      >
        <strong>{{ collection.title }}</strong>
        <span>{{ collection.groups.reduce((sum, group) => sum + group.ids.length, 0) }} examples</span>
      </a>
    </nav>

    <section
      v-for="collection in galleryCollections"
      :id="'collection-' + collection.id"
      :key="collection.id"
      class="gallery-collection"
    >
      <header class="gallery-collection-head">
        <div class="gallery-collection-kicker">Collection</div>
        <h2>{{ collection.title }}</h2>
        <p>{{ collection.intro }}</p>
      </header>

      <div v-if="collection.id === 'manim'" class="admonition note">
        <div class="admonition-title">来源</div>
        <p>
          条目结构对应 Manim Community v0.21.0 的官方 Example Gallery。
          每个示例都保留“官方示例 ↗”链接，便于对照原始 Manim 实现。
        </p>
      </div>

      <div v-if="collection.id === 'janim'" class="admonition important">
        <div class="admonition-title">致谢</div>
        <p>
          感谢 JAnim 项目在动画 API、效果设计和示例组织方面给 Zanim 提供的参考与启发。
          这里是效果级复刻，不是 JAnim API 兼容层。
        </p>
        <p><a href="https://github.com/jkjkil4/JAnim" target="_blank" rel="noreferrer">JAnim GitHub ↗</a></p>
      </div>

      <nav class="gallery-jump">
        <strong>本集合</strong>
        <a v-for="group in collection.groups" :key="group.id" :href="'#/gallery#' + group.id">
          {{ group.title }}
        </a>
      </nav>

      <section
        v-for="group in collection.groups"
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
