<script setup>
import { computed } from 'vue'
import CodeTabs from './CodeTabs.vue'
import LiveScene from './LiveScene.vue'
import { galleryById, janimCollection } from '../docs/catalog.js'
import { janimOfficialExamples } from '../docs/janimOfficial.js'
import { javascriptSource, janimPortPythonSource } from '../docs/sources.js'

const officialById = new Map(janimOfficialExamples.map((item) => [item.id, item]))

const semanticNotes = {
  'janim-updater': 'JAnim 通过 DataUpdater / ItemUpdater 按帧修改对象；Zanim 复刻使用 absolute-time provider 或显式 timeline clip，随机 seek 不依赖先前帧。',
  'janim-combine': 'JAnim 示例强调多个 updater 叠加；Zanim 使用同一绝对时间函数组合平移、波动、颜色和旋转，不引入隐藏逐帧状态。',
  'janim-balls': 'JAnim 使用 GroupStepUpdater 按 60 fps 推进物理。Zanim 使用 60 Hz deterministic Simulation，并显式映射 scene time → simulation time，因此暂停、续跑与随机 seek 一致。',
}

const groups = computed(() =>
  janimCollection.groups.map((group) => ({
    ...group,
    items: group.ids.map((id) => ({
      current: galleryById.get(id),
      official: officialById.get(id),
    })).filter((pair) => pair.current && pair.official),
  })),
)
</script>

<template>
  <article class="docs-article manim-compare-page">
    <div class="manim-page-kicker">JAnim 5.0.0-rc4 · API Demonstration</div>
    <h1>JAnim 复刻对照</h1>

    <div class="admonition note">
      <div class="admonition-title">基准来源</div>
      <p>
        <a
          href="https://janim.readthedocs.io/zh-cn/latest/examples/api_demonstration.html"
          target="_blank"
          rel="noreferrer"
        >
          打开 JAnim 官方 API Demonstration ↗
        </a>
      </p>
      <p>
        感谢 JAnim 项目在动画 API、效果设计和示例组织方面给 Zanim 提供的参考。
        这里复刻视觉与时间语义，不构建 JAnim API 兼容层。
      </p>
    </div>

    <nav class="manim-group-nav" aria-label="JAnim sections">
      <a v-for="group in groups" :key="group.id" :href="'#/janim#' + group.id">
        <strong>{{ group.title }}</strong>
        <span>{{ group.items.length }}</span>
      </a>
    </nav>

    <section v-for="group in groups" :id="group.id" :key="group.id" class="manim-compare-group">
      <header class="manim-group-head">
        <div class="gallery-collection-kicker">API Demonstration</div>
        <h2>{{ group.title }}</h2>
        <p>{{ group.intro }}</p>
      </header>

      <article
        v-for="{ current, official } in group.items"
        :id="current.id"
        :key="current.id"
        class="manim-compare-example"
      >
        <header class="manim-example-head">
          <div>
            <h3>{{ official.title }}</h3>
            <p>{{ current.description }}</p>
          </div>
          <a :href="official.sourceUrl" target="_blank" rel="noreferrer">官方条目 ↗</a>
        </header>

        <div class="manim-visual-grid">
          <section class="manim-reference-panel">
            <div class="manim-panel-head">
              <strong>JAnim 官方</strong>
              <span>MP4</span>
            </div>
            <div class="manim-reference-stage">
              <video
                :src="official.mediaUrl"
                controls
                loop
                muted
                playsinline
                preload="metadata"
              ></video>
            </div>
          </section>

          <section class="manim-zanim-panel">
            <div class="manim-panel-head">
              <strong>Zanim 当前实现</strong>
              <span>Live Scene</span>
            </div>
            <LiveScene :item="current" :autoplay="false" />
          </section>
        </div>

        <div v-if="semanticNotes[current.id]" class="admonition note manim-semantic-note">
          <div class="admonition-title">语义差异</div>
          <p>{{ semanticNotes[current.id] }}</p>
        </div>

        <div class="manim-code-grid">
          <section>
            <div class="manim-code-label">
              <strong>JAnim 原始代码</strong>
              <span>官方 5.0.0-rc4</span>
            </div>
            <CodeTabs :python="official.code" max-height="25rem" />
          </section>

          <section>
            <div class="manim-code-label">
              <strong>Zanim 复刻代码</strong>
              <span>setup = layout · construct = timeline</span>
            </div>
            <CodeTabs
              :python="janimPortPythonSource(current)"
              :js="javascriptSource(current)"
              max-height="25rem"
            />
          </section>
        </div>
      </article>
    </section>
  </article>
</template>
