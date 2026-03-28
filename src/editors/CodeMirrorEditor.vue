<template>
  <div ref="containerEl" class="cm-wrapper"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { undo, redo } from '@codemirror/commands'
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

/**
 * 插入文本到当前光标位置
 * @param text 要插入的文本（字符串或函数）
 * @param wrapText 包裹文本的前后缀
 */
function insertText(text: string | ((selection: string) => string), wrapText?: { before: string; after: string }) {
  if (!view) return
  
  const selection = view.state.selection.main
  const selectedText = view.state.doc.sliceString(selection.from, selection.to)
  
  let insertedText: string
  let cursorOffset = 0
  
  if (wrapText) {
    // 包裹选中的文本
    insertedText = `${wrapText.before}${selectedText}${wrapText.after}`
    // 如果没有选中文本，光标移到中间
    cursorOffset = selectedText ? insertedText.length : wrapText.before.length
  } else {
    // 生成要插入的文本
    if (typeof text === 'function') {
      insertedText = text(selectedText)
    } else {
      insertedText = text
    }
    cursorOffset = insertedText.length
  }
  
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert: insertedText },
    selection: { anchor: selection.from + cursorOffset }
  })
  
  view.focus()
}

function performUndo() {
  if (view) undo(view)
}

function performRedo() {
  if (view) redo(view)
}

function scrollToPosition(pos: number) {
  if (!view) return
  view.dispatch({
    selection: { anchor: pos },
    effects: EditorView.scrollIntoView(pos, { y: 'start' })
  })
  view.focus()
}

function getEditorState() {
  return view?.state
}

// 暴露方法给父组件
defineExpose({
  insertText,
  undo: performUndo,
  redo: performRedo,
  scrollToPosition,
  getEditorState
})

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
