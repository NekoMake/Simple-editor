<template>
  <div class="editor-settings">
    <div class="setting-row">
      <span class="setting-name">字号</span>
      <div class="adj-group">
        <button class="adj-btn" @click="adj('fontSize', -1)"><MdIcon name="remove" size="sm"/></button>
        <span class="adj-val">{{ es.fontSize }}px</span>
        <button class="adj-btn" @click="adj('fontSize', 1)"><MdIcon name="add" size="sm"/></button>
      </div>
    </div>

    <div class="setting-row">
      <span class="setting-name">Tab 宽度</span>
      <div class="adj-group">
        <button class="adj-btn" @click="setTab(2)">2</button>
        <button class="adj-btn" @click="setTab(4)">4</button>
      </div>
    </div>

    <div class="setting-row">
      <span class="setting-name">自动换行</span>
      <button class="toggle-btn" :class="{ on: es.wordWrap }" @click="toggle('wordWrap')">
        {{ es.wordWrap ? '开' : '关' }}
      </button>
    </div>

    <div class="setting-row">
      <span class="setting-name">行号</span>
      <button class="toggle-btn" :class="{ on: es.lineNumbers }" @click="toggle('lineNumbers')">
        {{ es.lineNumbers ? '开' : '关' }}
      </button>
    </div>

    <div class="setting-row">
      <span class="setting-name">字体</span>
      <select class="font-select" v-model="es.fontFamily">
        <option value="var(--app-font-sans)">系统字体</option>
        <option value="var(--app-font-mono)">等宽字体</option>
        <option v-for="f in customFonts" :key="f.name" :value="f.name">{{ f.name }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const es = computed(() => settingsStore.editor)
const customFonts = computed(() => settingsStore.customFonts)

function adj(key: 'fontSize', delta: number) {
  settingsStore.updateEditor({ [key]: Math.min(28, Math.max(10, es.value[key] + delta)) })
}
function setTab(n: 2 | 4) { settingsStore.updateEditor({ tabSize: n }) }
function toggle(key: 'wordWrap' | 'lineNumbers') {
  settingsStore.updateEditor({ [key]: !es.value[key] })
}
</script>

<style scoped>
.editor-settings { display: flex; flex-direction: column; gap: 4px; padding-bottom: 16px; }
.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  height: 52px; padding: 0 4px;
}
.setting-name { font-size: 16px; color: var(--md-on-surface); }
.adj-group { display: flex; align-items: center; gap: 4px; }
.adj-btn {
  min-width: 36px; height: 36px; border-radius: 8px;
  border: none; cursor: pointer;
  background: var(--md-surface-container-high);
  color: var(--md-on-surface); font-size: 14px; font-weight: 500;
  font-family: inherit;
  display: flex; align-items: center; justify-content: center;
}
.adj-val { min-width: 48px; text-align: center; font-size: 14px; }
.toggle-btn {
  width: 52px; height: 32px; border-radius: 16px;
  border: 2px solid var(--md-outline);
  cursor: pointer; font-size: 13px; font-weight: 500; font-family: inherit;
  background: transparent; color: var(--md-on-surface-variant);
  transition: all .2s;
}
.toggle-btn.on {
  background: var(--md-primary); color: var(--md-on-primary); border-color: transparent;
}
.font-select {
  background: var(--md-surface-container-highest);
  border: none; border-radius: 8px; padding: 8px 12px;
  font-size: 14px; color: var(--md-on-surface); max-width: 160px;
}
</style>
