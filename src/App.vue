<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import DocPage from './components/DocPage.vue'
import GalleryPage from './components/GalleryPage.vue'
import { galleryCollections, galleryItems } from './docs/catalog.js'
import { navGroups, pageFor, pages } from './docs/content.js'

const route = ref('/')
const routeAnchor = ref('')
const search = ref('')
const mobileOpen = ref(false)
const theme = ref('light')

function parseHash() {
  const raw = location.hash.slice(1) || '/'
  const [path, anchor = ''] = raw.split('#')
  route.value = pages[path] || path === '/gallery' ? path : '/'
  routeAnchor.value = anchor
  mobileOpen.value = false
  nextTick(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: 'start' })
      else window.scrollTo({ top: 0 })
    }))
  })
}

function navigate(path) {
  if (/^https?:\/\//.test(path)) {
    window.open(path, '_blank', 'noopener,noreferrer')
    return
  }
  location.hash = path
}

const activePage = computed(() => pageFor(route.value))
const tocItems = computed(() => {
  if (route.value === '/gallery') return galleryCollections.map((collection) => ['collection-' + collection.id, collection.title])
  return (activePage.value.sections ?? []).map((section) => [section.id, section.title])
})

const searchResults = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  const result = []
  for (const [path, page] of Object.entries(pages)) {
    const haystack = [page.title, page.lead, ...(page.sections ?? []).map((x) => x.title)].join(' ').toLowerCase()
    if (haystack.includes(q)) result.push({ path, title: page.title, kind: '文档' })
  }
  for (const item of galleryItems) {
    const haystack = [item.titleZh, item.description, item.source, item.categoryTitle].join(' ').toLowerCase()
    if (haystack.includes(q)) result.push({ path: `/gallery#${item.id}`, title: item.titleZh, kind: item.categoryTitle })
  }
  return result.slice(0, 12)
})

function chooseSearch(path) {
  search.value = ''
  navigate(path)
}

function scrollToc(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function backTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function applyTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
  localStorage.setItem('zanim-docs-theme', value)
}

function toggleTheme() {
  applyTheme(theme.value === 'light' ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('zanim-docs-theme')
  const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  applyTheme(saved ?? preferred)
  parseHash()
  addEventListener('hashchange', parseHash)
})

onBeforeUnmount(() => removeEventListener('hashchange', parseHash))
</script>

<template>
  <div class="docs-site">
    <header class="mobile-header">
      <button class="mobile-menu-button" @click="mobileOpen = !mobileOpen" aria-label="打开文档导航">☰</button>
      <a href="#/" class="mobile-brand">Zanim 文档</a>
      <button class="theme-button mobile-theme" @click="toggleTheme" :aria-label="theme === 'light' ? '切换深色模式' : '切换浅色模式'">
        {{ theme === 'light' ? '◐' : '◑' }}
      </button>
    </header>

    <aside class="docs-sidebar" :class="{ open: mobileOpen }">
      <div class="sidebar-brand">
        <a href="#/" class="brand-title">Zanim</a>
        <span>v0.7.0rc1</span>
      </div>

      <div class="sidebar-search">
        <span>⌕</span>
        <input v-model="search" placeholder="搜索文档" aria-label="搜索文档" />
        <div v-if="searchResults.length" class="search-results">
          <button v-for="result in searchResults" :key="result.path" @click="chooseSearch(result.path)">
            <span>{{ result.title }}</span>
            <small>{{ result.kind }}</small>
          </button>
        </div>
      </div>

      <nav class="docs-nav">
        <section v-for="group in navGroups" :key="group.title">
          <h2>{{ group.title }}</h2>
          <template v-for="[path, label] in group.items" :key="path">
            <a
              v-if="/^https?:\/\//.test(path)"
              :href="path"
              target="_blank"
              rel="noreferrer"
            >{{ label }}</a>
            <a
              v-else
              href="#"
              :class="{ current: route === path }"
              @click.prevent="navigate(path)"
            >{{ label }}</a>
          </template>
        </section>
      </nav>

      <div class="sidebar-footer">
        <a href="https://github.com/zjwqsd/zanim" target="_blank" rel="noreferrer">GitHub</a>
        <button class="theme-button" @click="toggleTheme">
          {{ theme === 'light' ? '深色模式' : '浅色模式' }}
        </button>
      </div>
    </aside>

    <div v-if="mobileOpen" class="sidebar-scrim" @click="mobileOpen = false"></div>

    <main class="docs-main">
      <div class="docs-topbar">
        <div class="breadcrumbs">
          <a href="#/" @click.prevent="navigate('/')">Zanim</a>
          <span>/</span>
          <strong>{{ route === '/gallery' ? 'Example Gallery' : activePage.title }}</strong>
        </div>
        <div class="topbar-links">
          <a href="https://github.com/zjwqsd/zanim" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="https://zjwqsd.github.io/zanim/" target="_blank" rel="noreferrer">项目主页 ↗</a>
        </div>
      </div>

      <div class="docs-content">
        <GalleryPage v-if="route === '/gallery'" :on-navigate="navigate" />
        <DocPage v-else :page="activePage" :navigate="navigate" />

        <footer class="content-footer">
          <p>Zanim 文档 · MIT License · pre-1.0</p>
          <p>Showcase 页面中的动画均由 Zanim Web runtime 实时渲染。</p>
        </footer>
      </div>
    </main>

    <aside class="page-toc">
      <div class="toc-inner">
        <strong>本页目录</strong>
        <button
          v-for="[id, title] in tocItems"
          :key="id"
          @click="scrollToc(id)"
        >{{ title }}</button>
        <a href="#" @click.prevent="backTop">返回顶部 ↑</a>
      </div>
    </aside>
  </div>
</template>
