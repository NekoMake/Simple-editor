<template>
  <div class="editor-view">
    <!-- Top Bar -->
    <TopAppBar
      :title="file?.name ?? ''"
      show-back
      :scrolled="false"
      @back="goBack"
    >
      <template #actions>
        <!-- 预览/编辑切换（仅支持预览的格式） -->
        <IconButton
          v-if="hasSpecialPreview"
          :icon="mode === 'edit' ? 'preview' : 'edit'"
          :aria-label="mode === 'edit' ? '预览' : '编辑'"
          @click="toggleMode"
        />
        <!-- 还原与撤回按钮 -->
        <IconButton v-show="mode === 'edit'" icon="undo" aria-label="撤回" @click="handleUndo" />
        <IconButton v-show="mode === 'edit'" icon="redo" aria-label="还原" @click="handleRedo" />
        <!-- 保存状态 -->
        <IconButton
          :icon="isDirty ? 'save' : 'check_circle'"
          :aria-label="isDirty ? '保存' : '已保存'"
          :selected="!isDirty"
          @click="save"
        />
        <IconButton icon="more_vert" aria-label="更多" @click="showMenu = true" />
      </template>
    </TopAppBar>

    <!-- 加载态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>

    <template v-else-if="file">
      <!-- 编辑模式 -->
      <div v-show="mode === 'edit'" class="editor-wrapper">
        <div class="editor-container">
          <CodeMirrorEditor
            ref="editorRef"
            v-model="content"
            :format="file.format"
            @change="onChange"
          />
        </div>
        <!-- 工具栏（底部或侧边） -->
        <EditorToolbar
          v-if="toolbarActions.length > 0"
          :actions="toolbarActions"
          @action="handleToolbarAction"
        />
      </div>

      <!-- 预览模式 -->
      <div v-show="mode === 'preview'" class="preview-container">
        <NovelReader
          v-if="file.format === 'txt'"
          :content="content"
          @open-settings="showReadingSettings = true"
        />
        <MarkdownPreview
          v-else-if="file.format === 'md'"
          :content="content"
        />
        <!-- 其他格式只读编辑器 -->
        <CodeMirrorEditor
          v-else
          v-model="content"
          :format="file.format"
          :readonly="true"
        />
      </div>
    </template>

    <!-- 文件不存在 -->
    <div v-else class="empty-state">
      <MdIcon name="error_outline" size="xl" />
      <p>文件不存在</p>
      <MdButton @click="goBack">返回</MdButton>
    </div>

    <!-- 更多操作菜单 -->
    <BottomSheet v-model="showMenu" :title="file?.name">
      <div class="action-list">
        <button class="action-item" @click="doExport">
          <MdIcon name="ios_share" /><span>导出文件</span>
        </button>
        <button class="action-item" @click="showEditorSettings = true; showMenu = false">
          <MdIcon name="tune" /><span>编辑器设置</span>
        </button>
      </div>
    </BottomSheet>

    <!-- 阅读设置 -->
    <ReadingSettingsSheet v-model="showReadingSettings" />

    <!-- 编辑器设置 -->
    <BottomSheet v-model="showEditorSettings" title="编辑器设置">
      <EditorSettingsPanel />
    </BottomSheet>

    <!-- Markdown大纲 -->
    <MdDialog v-model="showMarkdownOutline" title="大纲">
      <div v-if="markdownHeadings.length === 0" class="empty-outline">
        暂无标题
      </div>
      <div v-else class="outline-list">
        <div 
          v-for="(heading, index) in markdownHeadings" 
          :key="index"
          class="outline-item"
          :style="{ paddingLeft: `${(heading.level - 1) * 16}px` }"
          @click="jumpToHeading(heading)"
        >
          <span class="outline-text">{{ heading.text }}</span>
        </div>
      </div>
    </MdDialog>

    <SnackbarHost />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopAppBar from '@/components/ui/TopAppBar.vue'
import IconButton from '@/components/ui/IconButton.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import MdButton from '@/components/ui/MdButton.vue'
import MdDialog from '@/components/ui/MdDialog.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import SnackbarHost from '@/components/ui/SnackbarHost.vue'
import EditorToolbar from '@/components/ui/EditorToolbar.vue'
import CodeMirrorEditor from '@/editors/CodeMirrorEditor.vue'
import NovelReader from '@/components/previews/NovelReader.vue'
import MarkdownPreview from '@/components/previews/MarkdownPreview.vue'
import ReadingSettingsSheet from '@/components/previews/ReadingSettingsSheet.vue'
import EditorSettingsPanel from '@/components/settings/EditorSettingsPanel.vue'
import { useFileStore } from '@/stores/files'
import { useUiStore } from '@/stores/ui'
import { useFileEditor } from '@/composables/useFileEditor'
import { getModuleById } from '@/editors/registry'
import { useSwipeBack } from '@/composables/useUI'
import { getToolbarActions } from '@/editors/toolbars'
import type { ToolbarAction } from '@/types/toolbar'
import { getMarkdownHeadings, type MarkdownHeading } from '@/editors/plugins/markdownOutline'

const props = defineProps<{ fileId: string }>()
const router = useRouter()
const fileStore = useFileStore()
const uiStore = useUiStore()

const file = computed(() => fileStore.getFileById(props.fileId))
const mod = computed(() => file.value ? getModuleById(file.value.format) : null)
const hasSpecialPreview = computed(() => mod.value?.hasSpecialPreview ?? false)
const toolbarActions = computed(() => file.value ? getToolbarActions(file.value.format) : [])

const mode = ref<'edit' | 'preview'>('edit')
const showMenu = ref(false)
const showReadingSettings = ref(false)
const showEditorSettings = ref(false)
const showMarkdownOutline = ref(false)
const markdownHeadings = ref<MarkdownHeading[]>([])
const editorRef = ref<InstanceType<typeof CodeMirrorEditor> | null>(null)

const { content, isDirty, isLoading, load, save, onChange } = file.value
  ? useFileEditor(file.value)
  : { content: ref(''), isDirty: ref(false), isLoading: ref(false), load: async () => {}, save: async () => {}, onChange: () => {} }

function toggleMode() {
  mode.value = mode.value === 'edit' ? 'preview' : 'edit'
}

function goBack() {
  if (isDirty.value) save()
  router.back()
}

async function doExport() {
  if (!file.value) return
  showMenu.value = false
  try {
    await fileStore.exportFile(file.value)
    uiStore.showSnackbar('已导出到文档文件夹')
  } catch {
    uiStore.showSnackbar('导出失败')
  }
}

/**
 * 处理工具栏操作
 */
function handleToolbarAction(action: ToolbarAction) {
  if (!editorRef.value || !file.value) return
  
  // 内置特例处理：Markdown大纲
  if (action.id === 'md-outline') {
    const state = editorRef.value.getEditorState?.()
    if (state) {
      markdownHeadings.value = getMarkdownHeadings(state)
      showMarkdownOutline.value = true
    }
    return
  }

  // 如果有自定义处理器，优先执行（传入编辑器上下文）
  if (action.handler) {
    action.handler({
      getContent: () => content.value,
      setContent: (text: string) => { content.value = text },
      format: file.value.format,
      showMessage: (msg: string, isError?: boolean) => {
        uiStore.showSnackbar(msg)
      },
    })
    return
  }
  
  // 处理文本插入
  if (action.insertText) {
    editorRef.value.insertText(action.insertText)
  } else if (action.wrapText) {
    editorRef.value.insertText('', action.wrapText)
  }
}

function handleUndo() {
  if (editorRef.value) {
    editorRef.value.undo()
  }
}

function handleRedo() {
  if (editorRef.value) {
    editorRef.value.redo()
  }
}

function jumpToHeading(heading: MarkdownHeading) {
  showMarkdownOutline.value = false
  if (editorRef.value && editorRef.value.scrollToPosition) {
    editorRef.value.scrollToPosition(heading.pos)
  }
}

useSwipeBack(goBack)

onMounted(() => {
  if (file.value) load()
})
</script>

<style scoped>
.editor-view {
  display: flex; flex-direction: column; height: 100%;
  background: var(--md-surface);
  overflow: hidden;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 平板及以上设备：工具栏放到侧边 */
@media (min-width: 768px) {
  .editor-wrapper {
    flex-direction: row;
  }
}

.editor-container, .preview-container {
  flex: 1; overflow: hidden;
  display: flex; flex-direction: column;
}

.loading-overlay {
  flex: 1; display: flex; align-items: center; justify-content: center;
}
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
  color: var(--md-on-surface-variant);
}
.action-list { display: flex; flex-direction: column; gap: 4px; }
.action-item {
  display: flex; align-items: center; gap: 16px;
  min-height: 56px; padding: 0 16px;
  border-radius: 12px; border: none; cursor: pointer;
  background: transparent; font-size: 16px;
  color: var(--md-on-surface); font-family: inherit;
}
.action-item:active { background: var(--md-surface-container-high); }
.loading-dots { display: flex; gap: 8px; }
.loading-dots span {
  width: 8px; height: 8px; background: var(--md-primary);
  border-radius: 50%; animation: bounce 1.2s infinite alternate;
}
.loading-dots span:nth-child(2) { animation-delay: .2s; }
.loading-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce { to { transform: translateY(-8px); opacity: .6; } }

/* 大纲样式 */
.outline-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 50vh;
  overflow-y: auto;
  padding: 8px 0;
}
.outline-item {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 8px 16px;
  border-radius: var(--md-shape-sm, 8px);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--md-on-surface);
}
.outline-item:active, .outline-item:hover {
  background-color: var(--md-surface-container-high, rgba(0, 0, 0, 0.08));
}
.outline-text {
  font-size: 15px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty-outline {
  padding: 24px;
  text-align: center;
  color: var(--md-on-surface-variant);
}
</style>
