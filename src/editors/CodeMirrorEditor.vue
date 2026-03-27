<template>
  <div ref="containerEl" class="cm-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { buildBaseExtensions } from '@/editors/base'
import { getLanguageExtensions } from '@/editors/langLoader'
import { useSettingsStore } from '@/stores/settings'
import { useThemeStore } from '@/stores/theme'
import type { FileFormat } from '@/types'

const props = defineProps<{
  modelValue: string
  format: FileFormat
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [v: string]
  change: [v: string]
}>()

const containerEl = ref<HTMLElement | null>(null)
let view: EditorView | null = null

const settingsStore = useSettingsStore()
const themeStore = useThemeStore()

function buildExtensions() {
  const base = buildBaseExtensions({
    fontSize: settingsStore.editor.fontSize,
    fontFamily: settingsStore.editor.fontFamily,
    tabSize: settingsStore.editor.tabSize,
    wordWrap: settingsStore.editor.wordWrap,
    showLineNumbers: settingsStore.editor.lineNumbers,
    onChange: (val) => {
      emit('update:modelValue', val)
      emit('change', val)
    },
    isDark: themeStore.isDark,
  })

  const langExts = getLanguageExtensions(props.format)
  const extra = props.readonly ? [EditorView.editable.of(false)] : []

  return [...base, ...langExts, ...extra]
}

function initEditor() {
  if (!containerEl.value) return
  const state = EditorState.create({
    doc: props.modelValue,
    extensions: buildExtensions(),
  })
  view = new EditorView({ state, parent: containerEl.value })
}

function destroyEditor() {
  view?.destroy()
  view = null
}

function rebuildEditor() {
  destroyEditor()
  initEditor()
}

// 外部修改内容时同步（不破坏光标）
watch(() => props.modelValue, (newVal) => {
  if (!view) return
  const current = view.state.doc.toString()
  if (current !== newVal) {
    view.dispatch({
      changes: { from: 0, to: current.length, insert: newVal },
    })
  }
})

// 设置/主题变更时重建
watch(
  [() => settingsStore.editor, () => themeStore.isDark],
  () => rebuildEditor(),
  { deep: true }
)

onMounted(() => initEditor())
onBeforeUnmount(() => destroyEditor())
</script>

<style scoped>
.cm-wrapper {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.cm-wrapper :deep(.cm-editor) {
  flex: 1;
  height: 100%;
}
</style>
