<template>
  <BottomSheet v-model="show" title="阅读设置">
    <!-- 预设主题 -->
    <div class="setting-section">
      <div class="section-label">背景预设</div>
      <div class="preset-row">
        <button
          v-for="p in PRESETS"
          :key="p.id"
          class="preset-btn"
          :class="{ active: rs.preset === p.id }"
          :style="{ background: p.bg, color: p.text, borderColor: p.border }"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
    </div>

    <hr class="divider" />

    <!-- 字号 -->
    <div class="setting-row">
      <span class="setting-name">字号</span>
      <div class="slider-group">
        <button class="adj-btn" @click="adjust('fontSize', -1)"><MdIcon name="remove" size="sm"/></button>
        <span class="adj-val">{{ rs.fontSize }}px</span>
        <button class="adj-btn" @click="adjust('fontSize', 1)"><MdIcon name="add" size="sm"/></button>
      </div>
    </div>

    <!-- 行高 -->
    <div class="setting-row">
      <span class="setting-name">行距</span>
      <div class="slider-group">
        <button class="adj-btn" @click="adjustFloat('lineHeight', -0.1)"><MdIcon name="remove" size="sm"/></button>
        <span class="adj-val">{{ rs.lineHeight.toFixed(1) }}</span>
        <button class="adj-btn" @click="adjustFloat('lineHeight', 0.1)"><MdIcon name="add" size="sm"/></button>
      </div>
    </div>

    <!-- 边距 -->
    <div class="setting-row">
      <span class="setting-name">边距</span>
      <div class="slider-group">
        <button class="adj-btn" @click="adjust('pageMargin', -4)"><MdIcon name="remove" size="sm"/></button>
        <span class="adj-val">{{ rs.pageMargin }}px</span>
        <button class="adj-btn" @click="adjust('pageMargin', 4)"><MdIcon name="add" size="sm"/></button>
      </div>
    </div>

    <!-- 段落距 -->
    <div class="setting-row">
      <span class="setting-name">段落间距</span>
      <div class="slider-group">
        <button class="adj-btn" @click="adjustFloat('paragraphSpacing', -0.1)"><MdIcon name="remove" size="sm"/></button>
        <span class="adj-val">{{ rs.paragraphSpacing.toFixed(1) }}em</span>
        <button class="adj-btn" @click="adjustFloat('paragraphSpacing', 0.1)"><MdIcon name="add" size="sm"/></button>
      </div>
    </div>

    <!-- 自定义字体选择 -->
    <div class="setting-row" v-if="allFonts.length > 0">
      <span class="setting-name">字体</span>
      <select class="font-select" v-model="rs.fontFamily">
        <option value="var(--app-font-reading)">系统默认</option>
        <option v-for="f in allFonts" :key="f.name" :value="f.name">{{ f.name }}</option>
      </select>
    </div>

    <div class="action-row">
      <MdButton variant="text" @click="settingsStore.resetReading()">重置</MdButton>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import MdButton from '@/components/ui/MdButton.vue'
import { useSettingsStore } from '@/stores/settings'

const show = defineModel<boolean>({ required: true })
const settingsStore = useSettingsStore()
const rs = computed(() => settingsStore.reading)
const allFonts = computed(() => settingsStore.customFonts)

const PRESETS = [
  { id: 'white', label: '白纸', bg: '#ffffff', text: '#1a1a1a', border: '#e0e0e0' },
  { id: 'sepia', label: '羊皮', bg: '#f5efe0', text: '#3d2e0d', border: '#d4c89a' },
  { id: 'gray',  label: '灰调', bg: '#e8e8e8', text: '#222222', border: '#c0c0c0' },
  { id: 'dark',  label: '深夜', bg: '#1a1a1a', text: '#c8c8c8', border: '#333333' },
] as const

function applyPreset(p: typeof PRESETS[number]) {
  settingsStore.updateReading({
    preset: p.id,
    backgroundColor: p.bg,
    textColor: p.text,
  })
}

function adjust(key: 'fontSize' | 'pageMargin', delta: number) {
  const min = key === 'fontSize' ? 12 : 0
  const max = key === 'fontSize' ? 36 : 60
  settingsStore.updateReading({
    [key]: Math.min(max, Math.max(min, (rs.value[key] as number) + delta)),
  })
}

function adjustFloat(key: 'lineHeight' | 'paragraphSpacing', delta: number) {
  const min = key === 'lineHeight' ? 1.2 : 0
  const max = key === 'lineHeight' ? 3 : 3
  const current = rs.value[key] as number
  settingsStore.updateReading({
    [key]: Math.min(max, Math.max(min, Math.round((current + delta) * 10) / 10)),
  })
}
</script>

<style scoped>
.setting-section { margin-bottom: 12px; }
.section-label { font-size: 12px; color: var(--md-on-surface-variant); margin-bottom: 8px; }
.preset-row { display: flex; gap: 8px; flex-wrap: wrap; }
.preset-btn {
  padding: 8px 16px; border-radius: 8px; border: 1.5px solid;
  font-size: 14px; font-weight: 500; cursor: pointer;
  font-family: inherit;
  transition: transform .1s;
}
.preset-btn.active { box-shadow: 0 0 0 2px var(--md-primary); }
.preset-btn:active { transform: scale(.95); }
.divider { border: none; border-top: 1px solid var(--md-outline-variant); margin: 12px 0; }
.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  height: 48px;
}
.setting-name { font-size: 16px; color: var(--md-on-surface); }
.slider-group { display: flex; align-items: center; gap: 4px; }
.adj-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: none; cursor: pointer;
  background: var(--md-surface-container-high);
  color: var(--md-on-surface);
  display: flex; align-items: center; justify-content: center;
}
.adj-val { min-width: 52px; text-align: center; font-size: 14px; }
.font-select {
  background: var(--md-surface-container-highest);
  border: none; border-radius: 8px;
  padding: 8px 12px; font-size: 14px;
  color: var(--md-on-surface);
  max-width: 160px;
}
.action-row { display: flex; justify-content: flex-end; margin-top: 8px; }
</style>
