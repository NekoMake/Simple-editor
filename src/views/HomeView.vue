<template>
  <div class="home-view">

    <!-- Hero 头部 -->
    <div 
      class="home-hero"
      :style="heroStyle"
    >
      <div class="hero-top-actions">
        <IconButton icon="search" aria-label="搜索" @click="toggleSearch" />
        <IconButton icon="settings" aria-label="设置" @click="router.push('/settings')" />
      </div>
    </div>

    <!-- 搜索框 -->
    <transition name="search-expand">
      <div v-if="showSearch" class="search-bar">
        <div class="search-field">
          <MdIcon name="search" size="sm" />
          <input
            ref="searchInput"
            v-model="fileStore.filter.query"
            placeholder="搜索文件名…"
            class="search-input"
            @keydown.escape="closeSearch"
          />
          <IconButton v-if="fileStore.filter.query" icon="close" size="sm" aria-label="清除" @click="fileStore.filter.query = ''" />
        </div>
      </div>
    </transition>

    <!-- 格式筛选 Chips（粘性） -->
    <div class="filter-bar">
      <div class="filter-bar-content">
        <ChipGroup :options="FORMAT_OPTIONS" v-model="fileStore.filter.format" aria-label="文件格式筛选" />
        <div class="view-mode-toggle">
          <IconButton 
            :icon="settingsStore.homeViewMode === 'list' ? 'view_list' : 'grid_view'"
            aria-label="切换视图"
            @click="toggleViewMode"
          />
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="file-list" :class="settingsStore.homeViewMode" @scroll.passive="onScroll">
      <div v-if="fileStore.isLoading" class="empty-state">
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>

      <template v-else-if="fileStore.filteredFiles.length > 0">
        <FileCard
          v-for="file in fileStore.filteredFiles"
          :key="file.id"
          :file="file"
          :view-mode="settingsStore.homeViewMode"
          @click="openFile(file.id)"
          @long-press="showFileMenu(file.id)"
        >
          <template #actions>
            <IconButton icon="more_vert" aria-label="更多操作" @click.stop="showFileMenu(file.id)" />
          </template>
        </FileCard>
      </template>

      <div v-else class="empty-state">
        <MdIcon name="folder_open" size="xl" />
        <p>还没有文件</p>
        <p class="empty-hint">点击右下角 + 新建文件</p>
      </div>
    </div>

    <div class="home-footer-intro">
      <div class="footer-intro-icon">
        <MdIcon name="edit_note" size="sm" />
      </div>
      <div class="footer-intro-text">
        <div class="footer-intro-title">简单编辑</div>
        <div class="footer-intro-sub">多格式文本编辑器</div>
      </div>
    </div>

    <!-- 排序/操作 FAB -->
    <div class="fab-area">
      <button class="fab fab-primary" @click="showCreateSheet = true" aria-label="新建文件">
        <MdIcon name="add" size="lg" />
      </button>
    </div>

    <!-- 新建文件 BottomSheet -->
    <BottomSheet v-model="showCreateSheet" title="新建文件">
      <div class="new-file-grid">
        <button
          v-for="mod in MODULE_REGISTRY"
          :key="mod.id"
          class="new-file-btn"
          :style="{ '--chip-color': `var(${mod.color})`, '--chip-on-color': `var(${mod.onColor})` }"
          @click="startCreate(mod.id as FileFormat)"
        >
          <span class="nfb-icon"><MdIcon :name="mod.icon" /></span>
          <span class="nfb-label">{{ mod.displayName }}</span>
        </button>
      </div>
    </BottomSheet>

    <!-- 创建文件对话框 -->
    <MdDialog v-model="showNameDialog" :title="`新建 ${pendingFormat?.toUpperCase()} 文件`" icon="edit_document">
      <div class="text-field">
        <label>文件名</label>
        <input
          ref="nameInput"
          v-model="newFileName"
          :placeholder="`example.${pendingFormat}`"
          @keydown.enter="confirmCreate"
        />
      </div>
      <template #actions>
        <MdButton variant="text" @click="showNameDialog = false">取消</MdButton>
        <MdButton variant="filled" @click="confirmCreate" :disabled="!newFileName.trim()">创建</MdButton>
      </template>
    </MdDialog>

    <!-- 文件操作 BottomSheet -->
    <BottomSheet v-model="showFileActions" :title="actionFile?.name">
      <div class="action-list">
        <button class="action-item" @click="doRename">
          <MdIcon name="drive_file_rename_outline" />
          <span>重命名</span>
        </button>
        <button class="action-item" @click="doExport">
          <MdIcon name="ios_share" />
          <span>导出</span>
        </button>
        <button class="action-item danger" @click="confirmDelete">
          <MdIcon name="delete_outline" />
          <span>删除</span>
        </button>
      </div>
    </BottomSheet>

    <!-- 删除确认 -->
    <MdDialog v-model="showDeleteConfirm" title="删除文件" icon="delete_forever">
      <p>确定删除「{{ actionFile?.name }}」？此操作无法撤销。</p>
      <template #actions>
        <MdButton variant="text" @click="showDeleteConfirm = false">取消</MdButton>
        <MdButton variant="filled" @click="doDelete">删除</MdButton>
      </template>
    </MdDialog>

    <!-- 重命名对话框 -->
    <MdDialog v-model="showRenameDialog" title="重命名" icon="drive_file_rename_outline">
      <div class="text-field">
        <label>新文件名</label>
        <input v-model="renameValue" @keydown.enter="doRenameConfirm" />
      </div>
      <template #actions>
        <MdButton variant="text" @click="showRenameDialog = false">取消</MdButton>
        <MdButton variant="filled" @click="doRenameConfirm">确认</MdButton>
      </template>
    </MdDialog>

    <SnackbarHost />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import IconButton from '@/components/ui/IconButton.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import MdButton from '@/components/ui/MdButton.vue'
import MdDialog from '@/components/ui/MdDialog.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import FileCard from '@/components/FileCard.vue'
import SnackbarHost from '@/components/ui/SnackbarHost.vue'
import { useFileStore } from '@/stores/files'
import { useUiStore } from '@/stores/ui'
import { useSettingsStore } from '@/stores/settings'
import { useScrollBehavior } from '@/composables/useUI'
import { MODULE_REGISTRY } from '@/editors/registry'
import type { FileFormat, AppFile } from '@/types'

const router = useRouter()
const fileStore = useFileStore()
const uiStore = useUiStore()
const settingsStore = useSettingsStore()
const { scrolled, onScroll } = useScrollBehavior()

// 计算Hero背景样式
const heroStyle = computed(() => {
  if (!settingsStore.homeBackgroundImage) {
    return {}
  }
  return {
    backgroundImage: `url(${settingsStore.homeBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const FORMAT_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: 'TXT', value: 'txt' },
  { label: 'MD', value: 'md' },
  { label: 'JSON', value: 'json' },
  { label: 'TOML', value: 'toml' },
  { label: 'YAML', value: 'yaml' },
]

// ---- 搜索 ----
const showSearch = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

async function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    fileStore.filter.query = ''
  }
}

async function closeSearch() {
  showSearch.value = false
  fileStore.filter.query = ''
}

// ---- 视图切换 ----
function toggleViewMode() {
  const newMode = settingsStore.homeViewMode === 'list' ? 'grid' : 'list'
  settingsStore.setHomeViewMode(newMode)
}

// ---- 新建 ----
const showCreateSheet = ref(false)
const showNameDialog = ref(false)
const pendingFormat = ref<FileFormat | null>(null)
const newFileName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

function startCreate(format: FileFormat) {
  pendingFormat.value = format
  newFileName.value = ''
  showCreateSheet.value = false
  showNameDialog.value = true
  nextTick(() => nameInput.value?.focus())
}

async function confirmCreate() {
  if (!newFileName.value.trim() || !pendingFormat.value) return
  try {
    const file = await fileStore.createFile(newFileName.value.trim(), pendingFormat.value)
    showNameDialog.value = false
    router.push(`/editor/${file.id}`)
  } catch {
    uiStore.showSnackbar('创建失败')
  }
}

// ---- 打开 ----
function openFile(id: string) {
  router.push(`/editor/${id}`)
}

// ---- 文件操作 ----
const showFileActions = ref(false)
const actionFile = ref<AppFile | null>(null)
const showDeleteConfirm = ref(false)
const showRenameDialog = ref(false)
const renameValue = ref('')

function showFileMenu(id: string) {
  actionFile.value = fileStore.getFileById(id) ?? null
  if (actionFile.value) showFileActions.value = true
}

function doRename() {
  if (!actionFile.value) return
  renameValue.value = actionFile.value.name.replace(/\.\w+$/, '')
  showFileActions.value = false
  showRenameDialog.value = true
}

async function doRenameConfirm() {
  if (!actionFile.value || !renameValue.value.trim()) return
  await fileStore.renameFile(actionFile.value.id, renameValue.value.trim())
  showRenameDialog.value = false
  uiStore.showSnackbar('已重命名')
}

async function doExport() {
  if (!actionFile.value) return
  showFileActions.value = false
  try {
    await fileStore.exportFile(actionFile.value)
    uiStore.showSnackbar('已导出到文档文件夹')
  } catch {
    uiStore.showSnackbar('导出失败')
  }
}

function confirmDelete() {
  showFileActions.value = false
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!actionFile.value) return
  await fileStore.deleteFile(actionFile.value.id)
  showDeleteConfirm.value = false
  uiStore.showSnackbar('已删除')
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--md-surface);
  overflow: hidden;
}

/* ---- Hero 头部 ---- */
.home-hero {
  flex-shrink: 0;
  background-color: var(--md-primary-container);
  padding: 0 8px 16px;
  position: relative;
  min-height: 160px;
  background-repeat: no-repeat;
}
.hero-top-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  gap: 4px;
  position: relative;
  z-index: 1;
}
.hero-top-actions :deep(.icon-btn) {
  color: var(--md-on-primary-container);
}

/* ---- 搜索框 ---- */
.search-bar { padding: 8px 16px; background: var(--md-surface); }
.search-field {
  display: flex; align-items: center; gap: 8px;
  background: var(--md-surface-container-high);
  border-radius: 28px; padding: 4px 4px 4px 16px;
}
.search-input {
  flex: 1; border: none; background: transparent;
  font-size: 16px; color: var(--md-on-surface); outline: none;
}

/* ---- 筛选栏（粘性） ---- */
.filter-bar {
  flex-shrink: 0;
  padding: 10px 16px;
  background: var(--md-surface);
  border-bottom: 1px solid var(--md-outline-variant);
  position: sticky;
  top: 0;
  z-index: 10;
}
.filter-bar-content {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
}
.filter-bar-content::-webkit-scrollbar { display: none; }
.view-mode-toggle {
  flex-shrink: 0;
  margin-left: auto;
}

/* ---- 文件列表（可滚动区域） ---- */
.file-list { flex: 1; overflow-y: auto; padding: 0 8px; }

/* Grid视图布局 */
.file-list.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  padding: 8px;
  align-content: start;
}

.home-footer-intro {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 12px 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--md-surface-container-low);
  border: 1px solid var(--md-outline-variant);
}
.footer-intro-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.footer-intro-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.footer-intro-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--md-on-surface);
}
.footer-intro-sub {
  font-size: 12px;
  color: var(--md-on-surface-variant);
}

/* ---- FAB ---- */
.fab-area {
  position: fixed; bottom: 24px; right: 20px;
  display: flex; flex-direction: column; gap: 12px; align-items: center;
}
.fab-primary {
  width: 56px; height: 56px; border-radius: 16px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,.3),0 2px 6px 2px rgba(0,0,0,.15);
  transition: transform .15s;
}
.fab-primary:active { transform: scale(.92); }

.new-file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  padding: 8px 0 16px;
}
.new-file-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 16px 8px;
  border-radius: 16px;
  background: var(--chip-color);
  border: none; cursor: pointer;
  transition: transform .1s;
}
.new-file-btn:active { transform: scale(.93); }
.nfb-icon { color: var(--chip-on-color); }
.nfb-label { font-size: 13px; font-weight: 500; color: var(--chip-on-color); }

.action-list { display: flex; flex-direction: column; gap: 4px; }
.action-item {
  display: flex; align-items: center; gap: 16px;
  min-height: 56px; padding: 0 16px;
  border-radius: 12px; border: none; cursor: pointer;
  background: transparent; font-size: 16px;
  color: var(--md-on-surface); font-family: inherit;
  transition: background .1s;
}
.action-item:active { background: var(--md-surface-container-high); }
.action-item.danger { color: var(--md-error); }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px;
  min-height: 50vh;
  color: var(--md-on-surface-variant);
}
.empty-hint { font-size: 14px; }

.text-field { display: flex; flex-direction: column; gap: 6px; }
.text-field label { font-size: 12px; color: var(--md-on-surface-variant); }
.text-field input {
  background: var(--md-surface-container-highest);
  border: none; border-radius: 8px;
  padding: 12px 16px; font-size: 16px;
  color: var(--md-on-surface); outline: 2px solid transparent;
  font-family: inherit;
}
.text-field input:focus { outline-color: var(--md-primary); }

/* 搜索展开动画 */
.search-expand-enter-active, .search-expand-leave-active {
  transition: max-height .25s ease, opacity .2s;
  overflow: hidden;
}
.search-expand-enter-from, .search-expand-leave-to { max-height: 0; opacity: 0; }
.search-expand-enter-to, .search-expand-leave-from { max-height: 80px; }

/* 加载点 */
.loading-dots { display: flex; gap: 8px; }
.loading-dots span {
  width: 8px; height: 8px; background: var(--md-primary);
  border-radius: 50%; animation: bounce 1.2s infinite alternate;
}
.loading-dots span:nth-child(2) { animation-delay: .2s; }
.loading-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce { to { transform: translateY(-8px); opacity: .6; } }
</style>
