<script setup>
import { categoryItems, galleryGroups } from '../docs/catalog.js'
import GalleryExample from './GalleryExample.vue'

defineProps({
  onNavigate: { type: Function, default: null },
})
</script>

<template>
  <article class="docs-article gallery-page">
    <h1>Example Gallery</h1>
    <p class="lead">
      这里收录 Zanim 当前公开 examples 中适合网页实时展示的全部场景。
      每个示例都给出对应 Python 源码、Web/JavaScript 实现，并直接运行真实
      <code>@zanim/web</code> Scene；不使用预录视频代替输出。
    </p>

    <div class="admonition tip">
      <div class="admonition-title">提示</div>
      <p>
        真实 MNIST 训练（<code>mnist_training.py</code>）和 MIDI Piano
        （<code>midi_piano.py</code>）保留在仓库中，但不放进网页 Gallery：
        两者运行链路长、资源重，不适合作为文档页里的即时示例。
      </p>
    </div>

    <p>
      Gallery 的组织方式参考 Manim Community 文档的 Example Gallery：
      按功能分节，每个条目依次展示结果、代码与 References。
      不同之处是这里的输出是可播放、可暂停、可任意 seek 的 Zanim Scene。
    </p>

    <nav class="gallery-jump">
      <strong>本页目录</strong>
      <a v-for="group in galleryGroups" :key="group.id" :href="'#' + group.id">{{ group.title }}</a>
    </nav>

    <section
      v-for="group in galleryGroups"
      :id="group.id"
      :key="group.id"
      class="gallery-group"
    >
      <h2>
        <span class="heading-anchor" aria-hidden="true">#</span>
        {{ group.title }}
      </h2>
      <p>{{ group.intro }}</p>

      <div v-if="group.id === 'janim'" class="admonition important">
        <div class="admonition-title">致谢</div>
        <p>
          感谢 JAnim 项目在动画 API、效果设计和示例组织方面给 Zanim 提供的参考与启发。
          这一分类是用 Zanim 自己的状态模型与公开 API 重新实现 JAnim 的公开示例效果，
          不是兼容层，也不追求逐 API 对齐。
        </p>
        <p><a href="https://github.com/jkjkil4/JAnim" target="_blank" rel="noreferrer">JAnim GitHub ↗</a></p>
      </div>

      <GalleryExample
        v-for="item in categoryItems(group.id)"
        :key="item.id"
        :item="item"
      />
    </section>
  </article>
</template>
