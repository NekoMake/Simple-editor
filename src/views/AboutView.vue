<template>
  <div class="about-view">
    <TopAppBar title="关于" show-back @back="router.back()" :scrolled="scrolled" />

    <div class="about-body" @scroll.passive="onScroll">

      <!-- App 信息卡片 -->
      <div class="app-card">
        <div class="app-icon-wrap">
          <img src="/icon.svg" alt="应用图标" class="app-icon" />
        </div>
        <div class="app-name">简单编辑</div>
        <div class="app-version">版本 {{ VERSION }}</div>
      </div>

      <!-- 关于 section -->
      <div class="section-header">关于</div>

      <a
        class="list-item"
        href="https://github.com/NekoMake/Simple-editor"
        target="_blank"
        rel="noopener noreferrer"
        @click.prevent="openGitHub"
      >
        <MdIcon name="code" style="color:var(--md-on-surface-variant)" />
        <div class="item-content">
          <div class="item-title">查看源代码</div>
          <div class="item-sub">在 GitHub 上查看源代码</div>
        </div>
        <MdIcon name="chevron_right" style="color:var(--md-on-surface-variant)" />
      </a>

      <div class="list-item" @click="showLicenses = true">
        <MdIcon name="copyright" style="color:var(--md-on-surface-variant)" />
        <div class="item-content">
          <div class="item-title">开放源代码许可证</div>
          <div class="item-sub">查看本应用所使用的第三方开源库及其许可证信息</div>
        </div>
        <MdIcon name="chevron_right" style="color:var(--md-on-surface-variant)" />
      </div>

    </div>

    <!-- 开源许可证 BottomSheet -->
    <BottomSheet v-model="showLicenses" title="开放源代码许可证">
      <div class="license-list">
        <div v-for="lib in LICENSES" :key="lib.name" class="license-item">
          <div class="license-name">{{ lib.name }}</div>
          <div class="license-meta">
            <span class="license-badge">{{ lib.license }}</span>
            <span class="license-author">{{ lib.author }}</span>
          </div>
        </div>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TopAppBar from '@/components/ui/TopAppBar.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useScrollBehavior } from '@/composables/useUI'

const router = useRouter()
const { scrolled, onScroll } = useScrollBehavior()

const VERSION = '1.0.0'
const showLicenses = ref(false)

function openGitHub() {
  window.open('https://github.com/NekoMake/Simple-editor', '_blank', 'noopener,noreferrer')
}

const LICENSES = [
  { name: 'Vue',             license: 'MIT',              author: 'Evan You & Vue contributors' },
  { name: 'Vue Router',      license: 'MIT',              author: 'Evan You & Vue Router contributors' },
  { name: 'Pinia',           license: 'MIT',              author: 'Eduardo San Martin Morote' },
  { name: 'pinia-plugin-persistedstate', license: 'MIT', author: 'Sacha Arbonel' },
  { name: 'Vite',            license: 'MIT',              author: 'Evan You & Vite contributors' },
  { name: 'CodeMirror',      license: 'MIT',              author: 'Marijn Haverbeke & contributors' },
  { name: '@codemirror/lang-json',     license: 'MIT',   author: 'CodeMirror contributors' },
  { name: '@codemirror/lang-markdown', license: 'MIT',   author: 'CodeMirror contributors' },
  { name: '@codemirror/legacy-modes',  license: 'MIT',   author: 'CodeMirror contributors' },
  { name: '@codemirror/autocomplete',  license: 'MIT',   author: 'CodeMirror contributors' },
  { name: '@codemirror/lint',          license: 'MIT',   author: 'CodeMirror contributors' },
  { name: 'marked',          license: 'MIT',              author: 'Christopher Jeffrey & contributors' },
  { name: 'marked-highlight', license: 'MIT',             author: 'Marvin Hagemeister' },
  { name: 'highlight.js',    license: 'BSD-3-Clause',     author: 'Ivan Sagalaev & contributors' },
  { name: 'DOMPurify',       license: 'Apache-2.0 / MPL-2.0', author: 'Mario Heiderich & cure53' },
  { name: 'js-yaml',         license: 'MIT',              author: 'Vitaly Puzrin & contributors' },
  { name: 'smol-toml',       license: 'MIT',              author: 'Cynthia K. Rey' },
  { name: 'Capacitor',       license: 'MIT',              author: 'Ionic & Capacitor contributors' },
  { name: 'Material Symbols', license: 'Apache-2.0',      author: 'Google LLC' },
]
</script>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--md-surface);
}

.about-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
}

/* ── App 信息卡片 ─────────────────────────── */
.app-card {
  margin: 20px 16px 8px;
  background: var(--md-surface-container-low);
  border-radius: 20px;
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.app-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: var(--md-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 4px;
}

.app-icon {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--md-on-surface);
  letter-spacing: .3px;
}

.app-version {
  font-size: 14px;
  color: var(--md-on-surface-variant);
}

/* ── Section header ──────────────────────── */
.section-header {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .5px;
  color: var(--md-primary);
  text-transform: uppercase;
  padding: 20px 16px 4px;
}

/* ── List item ───────────────────────────── */
.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  cursor: pointer;
  min-height: 64px;
  text-decoration: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

.list-item:active {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 16px;
  color: var(--md-on-surface);
}

.item-sub {
  font-size: 13px;
  color: var(--md-on-surface-variant);
  margin-top: 2px;
  line-height: 1.4;
}

/* ── 开源许可证列表 ──────────────────────── */
.license-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
}

.license-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--md-outline-variant);
}

.license-item:last-child {
  border-bottom: none;
}

.license-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--md-on-surface);
  margin-bottom: 4px;
}

.license-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.license-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 100px;
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  letter-spacing: .3px;
}

.license-author {
  font-size: 12px;
  color: var(--md-on-surface-variant);
}
</style>
