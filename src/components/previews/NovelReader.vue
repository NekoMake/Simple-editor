<template>
  <div
    class="novel-reader"
    :style="readerStyle"
    @scroll.passive="onScroll"
    ref="scrollEl"
  >
    <!-- 顶部进度条 -->
    <div class="reading-progress-bar">
      <div class="reading-progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <div class="reader-content">
      <p
        v-for="(para, i) in paragraphs"
        :key="i"
        class="reader-para"
        :class="{ 'para-empty': !para.trim() }"
      >
        {{ para || '\u00A0' }}
      </p>
    </div>

    <!-- 悬浮设置按钮 -->
    <button class="settings-fab" @click="emit('openSettings')" aria-label="阅读设置">
      <MdIcon name="tune" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps<{ content: string }>()
const emit = defineEmits<{ openSettings: [] }>()

const settingsStore = useSettingsStore()
const scrollEl = ref<HTMLElement | null>(null)
const progress = ref(0)

const paragraphs = computed(() => props.content.split('\n'))

const rs = computed(() => settingsStore.reading)

const readerStyle = computed(() => ({
  fontSize: `${rs.value.fontSize}px`,
  lineHeight: String(rs.value.lineHeight),
  fontFamily: rs.value.fontFamily || 'var(--app-font-reading)',
  backgroundColor: rs.value.backgroundColor || 'var(--md-surface)',
  color: rs.value.textColor || 'var(--md-on-surface)',
  padding: `24px ${rs.value.pageMargin}px`,
  '--para-spacing': `${rs.value.paragraphSpacing}em`,
}))

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  const max = el.scrollHeight - el.clientHeight
  progress.value = max > 0 ? Math.round((el.scrollTop / max) * 100) : 0
}
</script>

<style scoped>
.novel-reader {
  height: 100%; overflow-y: auto;
  position: relative;
  transition: background-color .3s, color .3s;
}
.reading-progress-bar {
  position: sticky; top: 0; left: 0; right: 0;
  height: 3px; background: transparent; z-index: 5;
}
.reading-progress-fill {
  height: 100%; background: var(--md-primary);
  border-radius: 0 2px 2px 0;
  transition: width .1s linear;
}
.reader-content {
  max-width: 680px; margin: 0 auto;
  padding-bottom: 80px;
}
.reader-para {
  margin: 0;
  padding-bottom: var(--para-spacing, 0.8em);
  word-break: break-word;
  text-align: justify;
  text-indent: 2em;
}
.para-empty { padding-bottom: calc(var(--para-spacing, 0.8em) * 0.5); }
.settings-fab {
  position: fixed; bottom: 32px; right: 20px;
  width: 48px; height: 48px;
  border-radius: 16px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,.3),0 2px 6px 2px rgba(0,0,0,.15);
  transition: transform .15s;
  z-index: 10;
}
.settings-fab:active { transform: scale(.9); }
</style>
