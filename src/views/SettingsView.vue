<template>
  <div class="settings-view">
    <TopAppBar title="设置" show-back @back="router.back()" :scrolled="scrolled" />

    <div class="settings-body" @scroll.passive="onScroll">
      <!-- 外观 -->
      <div class="section-header">外观</div>

      <div class="list-item">
        <div class="item-content">
          <div class="item-title">深色模式</div>
        </div>
        <div class="mode-chips">
          <button
            v-for="m in MODES"
            :key="m.value"
            class="mode-chip"
            :class="{ active: themeStore.settings.mode === m.value }"
            @click="themeStore.setMode(m.value as 'light'|'dark'|'system')"
          >{{ m.label }}</button>
        </div>
      </div>

      <!-- 主题色 -->
      <div class="list-item aligned-top">
        <div class="item-content">
          <div class="item-title">主题颜色</div>
          <div class="item-sub">选择应用的主色调</div>
        </div>
        <div class="color-grid">
          <button
            v-for="(colors, key) in COLOR_SCHEMES"
            :key="key"
            class="color-dot"
            :style="{ background: colors.primary }"
            :class="{ active: themeStore.settings.colorScheme === key }"
            @click="themeStore.setColorScheme(key as ThemeColorScheme)"
            :title="COLOR_NAMES[key as ThemeColorScheme]"
          >
            <MdIcon v-if="themeStore.settings.colorScheme === key" name="check" size="sm" style="color:#fff" />
          </button>
        </div>
      </div>

      <div class="section-header">字体</div>

      <div class="list-item" @click="router.push('/font-manager')">
        <MdIcon name="font_download" style="color:var(--md-on-surface-variant)" />
        <div class="item-content">
          <div class="item-title">自定义字体</div>
          <div class="item-sub">已安装 {{ settingsStore.customFonts.length }} 个字体</div>
        </div>
        <MdIcon name="chevron_right" style="color:var(--md-on-surface-variant)" />
      </div>

      <div class="section-header">关于</div>

      <div class="list-item">
        <MdIcon name="info" style="color:var(--md-on-surface-variant)" />
        <div class="item-content">
          <div class="item-title">Simple-editor</div>
          <div class="item-sub">版本 1.0.0 · 多格式文本编辑器</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TopAppBar from '@/components/ui/TopAppBar.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'
import { useScrollBehavior } from '@/composables/useUI'
import type { ThemeColorScheme } from '@/types'

const router = useRouter()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const { scrolled, onScroll } = useScrollBehavior()

const MODES = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
]

const COLOR_SCHEMES = themeStore.COLOR_SCHEMES
const COLOR_NAMES: Record<ThemeColorScheme, string> = {
  teal: '青绿',
  purple: '紫色',
  blue: '蓝色',
  green: '绿色',
  orange: '橙色',
  rose: '玫瑰',
  custom: '自定义',
}
</script>

<style scoped>
.settings-view { display: flex; flex-direction: column; height: 100%; background: var(--md-surface); }
.settings-body { flex: 1; overflow-y: auto; padding-bottom: 40px; }
.section-header {
  font-size: 12px; font-weight: 600; letter-spacing: .5px;
  color: var(--md-primary); text-transform: uppercase;
  padding: 20px 16px 4px;
}
.list-item {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 16px; cursor: pointer; min-height: 56px;
}
.list-item.aligned-top { align-items: flex-start; padding-top: 14px; }
.list-item:active { background: color-mix(in srgb, var(--md-on-surface) 8%, transparent); }
.item-content { flex: 1; }
.item-title { font-size: 16px; color: var(--md-on-surface); }
.item-sub { font-size: 14px; color: var(--md-on-surface-variant); margin-top: 2px; }
.mode-chips { display: flex; gap: 6px; }
.mode-chip {
  height: 32px; padding: 0 12px;
  border-radius: 8px; border: 1px solid var(--md-outline);
  background: transparent; font-size: 13px; font-weight: 500;
  color: var(--md-on-surface-variant); cursor: pointer;
  font-family: inherit; white-space: nowrap;
}
.mode-chip.active {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  border-color: transparent;
}
.color-grid { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 4px; }
.color-dot {
  width: 36px; height: 36px; border-radius: 50%;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow .2s;
}
.color-dot.active { box-shadow: 0 0 0 3px var(--md-on-surface), 0 0 0 5px currentColor; }
</style>
