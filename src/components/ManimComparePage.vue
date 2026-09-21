<script setup>
import { computed } from 'vue'
import CodeTabs from './CodeTabs.vue'
import LiveScene from './LiveScene.vue'
import { galleryById, manimCollection } from '../docs/catalog.js'
import { manimOfficialExamples } from '../docs/manimOfficial.js'
import { javascriptSource, manimPortPythonSource } from '../docs/sources.js'

const officialById = new Map(manimOfficialExamples.map((item) => [item.id, item]))

const semanticNotes = {
  'manim-point-shapes': 'Manim 的 self.wait() 是 Wait animation，可参与 updater / stop condition 等动画语义；Zanim 的 wait() 是时间线 cursor 空档。此例结尾没有活动 updater，因此末尾 1 s 的可见效果等价：都只是保持最终帧。',
}

const groups = computed(() =>
  (manimCollection?.groups ?? []).map((group) => ({
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
    <div class="manim-page-kicker">Manim Community v0.21.0 · visual reference</div>
    <h1>Manim 复刻对照</h1>

    <div class="admonition note">
      <div class="admonition-title">基准来源</div>
      <p>
        <a href="https://docs.manim.community/en/stable/examples.html" target="_blank" rel="noreferrer">
          打开 Manim 官方 Example Gallery ↗
        </a>
      </p>
    </div>

    <nav class="manim-group-nav" aria-label="Manim sections">
      <a v-for="group in groups" :key="group.id" :href="'#/manim#' + group.id">
        <strong>{{ group.title }}</strong>
        <span>{{ group.items.length }}</span>
      </a>
    </nav>

    <section v-for="group in groups" :id="group.id" :key="group.id" class="manim-compare-group">
      <header class="manim-group-head">
        <div class="gallery-collection-kicker">Official section</div>
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
              <strong>Manim 官方</strong>
              <span>{{ official.kind === 'video' ? 'MP4' : 'PNG' }}</span>
            </div>
            <div class="manim-reference-stage">
              <video
                v-if="official.kind === 'video'"
                :src="official.mediaUrl"
                controls
                loop
                muted
                playsinline
                preload="metadata"
              ></video>
              <img v-else :src="official.mediaUrl" :alt="official.title + ' official output'" loading="lazy" />
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
              <strong>Manim 原始代码</strong>
              <span>官方 v0.21.0</span>
            </div>
            <CodeTabs :python="official.code" max-height="25rem" />
          </section>
          <section>
            <div class="manim-code-label">
              <strong>Zanim 复刻代码</strong>
              <span>{{ current.orbit3d ? 'Web 交互视角 · 右键 orbit' : 'setup = layout · construct = timeline' }}</span>
            </div>
            <CodeTabs
              :python="current.orbit3d ? '' : manimPortPythonSource(current)"
              :js="javascriptSource(current)"
              max-height="25rem"
            />
          </section>
        </div>
      </article>
    </section>
  </article>
</template>
