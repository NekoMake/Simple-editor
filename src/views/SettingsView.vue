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

      <!-- 首页背景图 -->
      <div class="list-item aligned-top">
        <div class="item-content">
          <div class="item-title">首页背景图</div>
          <div class="item-sub" v-if="!settingsStore.homeBackgroundImage">未设置</div>
          <div class="item-sub" v-else>已设置背景图</div>
        </div>
        <div class="bg-actions">
          <input
            ref="bgFileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleBackgroundImageChange"
          />
          <button class="mini-btn" @click="chooseBackgroundImage">
            <MdIcon name="image" size="sm" />
            选择
          </button>
          <button 
            v-if="settingsStore.homeBackgroundImage" 
            class="mini-btn danger"
            @click="clearBackgroundImage"
          >
            <MdIcon name="close" size="sm" />
            清除
          </button>
        </div>
      </div>

      <!-- 主题色 -->
      <div class="list-item aligned-top theme-color-item">
        <div class="item-content">
          <div class="item-title">主题颜色</div>
          <div class="item-sub">选择应用的主色调</div>
        </div>
        <div class="color-grid">
          <button
            v-for="(colors, key) in COLOR_SCHEMES"
            :key="key"
            class="color-dot"
            :style="{ background: key === 'custom' ? themeStore.settings.customPrimaryHex : colors.primary }"
            :class="{ active: themeStore.settings.colorScheme === key }"
            @click="handleColorSchemeClick(key as ThemeColorScheme)"
            :title="COLOR_NAMES[key as ThemeColorScheme]"
          >
            <MdIcon v-if="themeStore.settings.colorScheme === key" name="check" size="sm" style="color:#fff" />
          </button>
        </div>

        <button class="mini-btn custom-color-btn" @click="openCustomColorPicker">
          <MdIcon name="palette" size="sm" />
          自定义取色
        </button>
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

      <div class="list-item" @click="router.push('/about')">
        <MdIcon name="info" style="color:var(--md-on-surface-variant)" />
        <div class="item-content">
          <div class="item-title">简单编辑</div>
          <div class="item-sub">版本 1.0.0 · 多格式文本编辑器</div>
        </div>
        <MdIcon name="chevron_right" style="color:var(--md-on-surface-variant)" />
      </div>
    </div>

    <BottomSheet v-model="showCustomColorSheet" title="自定义主题色">
      <div class="custom-color-sheet">
        <ColorPicker v-model="customPrimaryHex" />
        <div class="custom-color-meta">当前颜色 {{ customPrimaryHex }}</div>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import TopAppBar from '@/components/ui/TopAppBar.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import ColorPicker from '@/components/ui/ColorPicker.vue'
import { useThemeStore } from '@/stores/theme'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'
import { useScrollBehavior } from '@/composables/useUI'
import type { ThemeColorScheme } from '@/types'

const router = useRouter()
const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()
const { scrolled, onScroll } = useScrollBehavior()

const bgFileInput = ref<HTMLInputElement | null>(null)
const showCustomColorSheet = ref(false)

const customPrimaryHex = computed({
  get: () => themeStore.settings.customPrimaryHex,
  set: (hex: string) => {
    themeStore.setColorScheme('custom', hex)
  },
})

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

function chooseBackgroundImage() {
  bgFileInput.value?.click()
}

function handleBackgroundImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    uiStore.showSnackbar('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    settingsStore.setHomeBackgroundImage(result)
    uiStore.showSnackbar('背景图已设置')
  }
  reader.onerror = () => {
    uiStore.showSnackbar('读取图片失败')
  }
  reader.readAsDataURL(file)
}

function clearBackgroundImage() {
  settingsStore.setHomeBackgroundImage('')
  uiStore.showSnackbar('已清除背景图')
}

function handleColorSchemeClick(scheme: ThemeColorScheme) {
  themeStore.setColorScheme(scheme)
}

function openCustomColorPicker() {
  themeStore.setColorScheme('custom')
  showCustomColorSheet.value = true
}
</script>

<style scoped>
.settings-view { display: flex; flex-direction: column; height: 100%; background: var(--md-surface); }
.settings-body { flex: 1; overflow-y: auto; padding-bottom: 40px; }

.bg-actions { display: flex; gap: 8px; align-items: center; }
.mini-btn {
  height: 32px; padding: 0 12px;
  border-radius: 8px; border: 1px solid var(--md-outline);
  background: var(--md-surface-container-high);
  font-size: 13px; font-weight: 500;
  color: var(--md-on-surface);
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; gap: 4px;
  white-space: nowrap;
}
.mini-btn:active { opacity: 0.7; }
.mini-btn.danger {
  color: var(--md-error);
  border-color: var(--md-error);
}
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
.item-content { flex: 1; min-width: 0; }
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
.custom-color-btn {
  margin-left: auto;
  margin-top: 10px;
}
.color-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 4px;
  flex: 0 0 auto;
}
.color-dot {
  width: 34px; height: 34px; border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--md-on-surface) 24%, transparent);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow .2s, transform .2s;
}
.color-dot.active {
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--md-surface) 88%, transparent),
    0 0 0 4px color-mix(in srgb, var(--md-on-surface) 45%, transparent);
}

.custom-color-sheet {
  display: grid;
  gap: 10px;
}

.custom-color-meta {
  font-size: 13px;
  color: var(--md-on-surface-variant);
}

@media (max-width: 420px) {
  .theme-color-item {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .theme-color-item .item-content {
    flex: 1 1 100%;
  }

  .theme-color-item .color-grid {
    width: 100%;
    justify-content: flex-start;
    padding-top: 8px;
  }
}
</style>
