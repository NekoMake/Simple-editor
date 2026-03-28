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
      <div class="hero-greeting">
        <h1 class="greeting-text">{{ greeting }}</h1>
        <p class="greeting-sub">欢迎回到简单编辑</p>
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
    <div class="file-list" :class="{ 'is-empty': !fileStore.isLoading && fileStore.filteredFiles.length === 0 }" @scroll.passive="onScroll">
      <Transition name="switch-list" mode="out-in">
        <div v-if="fileStore.isLoading" class="empty-state" key="loading">
          <div class="loading-dots"><span></span><span></span><span></span></div>
        </div>

        <div v-else-if="fileStore.filteredFiles.length > 0" class="file-list-content" :class="settingsStore.homeViewMode" :key="'list-' + fileStore.filter.format">
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
        </div>

        <div v-else class="empty-state" :key="'empty-state-' + fileStore.filter.format">
          <div class="empty-icon-wrapper">
            <MdIcon name="edit_document" size="xl" />
          </div>
          <p class="empty-title">一切从这里开始</p>
          <p class="empty-hint">
            未找到{{ fileStore.filter.format !== 'all' ? '对应的 ' + fileStore.filter.format.toUpperCase() + ' ' : '' }}文件
          </p>
          <MdButton variant="filled" @click="showCreateSheet = true" class="empty-cta">
            <MdIcon name="add" size="sm" style="margin-right: 8px;" />
            立即创建
          </MdButton>
        </div>
      </Transition>
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
    <transition name="fab-transition">
      <div v-show="!showFabMenu" class="fab-area">
        <button class="fab fab-primary" @click="showFabMenu = true" aria-label="添加文件">
          <MdIcon name="add" size="lg" />
        </button>
      </div>
    </transition>

    <!-- 隐藏的文件选择器 -->
    <input 
      type="file" 
      ref="fileInputRef" 
      style="display: none" 
      accept=".txt,.md,.json,.toml,.yaml,.yml" 
      @change="onFileImportChange" 
    />

    <!-- FAB 选择菜单 BottomSheet -->
    <BottomSheet v-model="showFabMenu" title="请选择操作">
      <div class="action-list">
        <button class="action-item" @click="openCreateSheet">
          <MdIcon name="edit_document" />
          <span>新建空白文件</span>
        </button>
        <button class="action-item" @click="triggerImport">
          <MdIcon name="file_upload" />
          <span>从本地导入文件</span>
        </button>
      </div>
    </BottomSheet>

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

// 动态问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

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

// ---- FAB 操作与导入 ----
const showFabMenu = ref(false)
const showCreateSheet = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function openCreateSheet() {
  showFabMenu.value = false
  setTimeout(() => {
    showCreateSheet.value = true
  }, 200) // 等待上一个 bottomsheet 关闭
}

function triggerImport() {
  showFabMenu.value = false
  fileInputRef.value?.click()
}

async function onFileImportChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const appFile = await fileStore.importWebContent(file.name, text)
    uiStore.showSnackbar('导入成功！')
    // 立即跳转至该文件
    router.push(`/editor/${appFile.id}`)
  } catch (err) {
    uiStore.showSnackbar('文件导入失败')
  } finally {
    target.value = '' // 清除 input 状态
  }
}

// ---- 新建 ----
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
  border-radius: 0 0 28px 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
  z-index: 2;
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
.hero-greeting {
  padding: 8px 16px 16px;
  position: relative;
  z-index: 1;
}
.greeting-text {
  font-size: 32px;
  font-weight: 400;
  margin: 0;
  color: var(--md-on-primary-container);
  letter-spacing: -0.5px;
}
.greeting-sub {
  font-size: 14px;
  margin: 6px 0 0;
  color: var(--md-on-primary-container);
  opacity: 0.8;
}

/* ---- 搜索框 ---- */
.search-bar { 
  padding: 8px 16px; 
  background: transparent; 
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 10;
}
.search-field {
  display: flex; align-items: center; gap: 8px;
  background: var(--md-surface-container-high);
  border-radius: 28px; padding: 4px 4px 4px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
.file-list { flex: 1; overflow-y: auto; padding: 0 8px; position: relative; }

.file-list-content {
  width: 100%;
}

/* 交错进场动画 */
.file-list-content > *, .empty-state {
  animation: fadeUp 0.4s cubic-bezier(0.2, 0, 0, 1) backwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 交错动画延迟 */
.file-list-content > *:nth-child(1) { animation-delay: 0.05s; }
.file-list-content > *:nth-child(2) { animation-delay: 0.10s; }
.file-list-content > *:nth-child(3) { animation-delay: 0.15s; }
.file-list-content > *:nth-child(4) { animation-delay: 0.20s; }
.file-list-content > *:nth-child(5) { animation-delay: 0.25s; }
.file-list-content > *:nth-child(6) { animation-delay: 0.30s; }
.file-list-content > *:nth-child(n+7) { animation-delay: 0.35s; }

/* 切换列表的退场/进场动画 */
.switch-list-enter-active,
.switch-list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.switch-list-enter-from {
  opacity: 0;
  /* 进场不偏移，交给内部元素的 fadeUp 去偏移，只控制外壳透明度避免闪烁 */
}
.switch-list-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

/* Grid视图布局 */
.file-list-content.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  padding: 8px;
  align-content: start;
}

.file-list.is-empty {
  display: flex !important;
  flex-direction: column;
}

.home-footer-intro {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 12px 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: transparent;
  border: 1px dashed var(--md-outline-variant);
  opacity: 0.6;
  transition: opacity 0.3s;
}
.home-footer-intro:hover {
  opacity: 1;
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
  display: flex; flex-direction: column; gap: 12px; align-items: flex-end;
  z-index: 100;
}
.fab-primary {
  height: 56px; 
  width: 56px;
  border-radius: 16px;
  background: var(--md-primary-container);
  color: var(--md-on-primary-container);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,.3),0 2px 6px 2px rgba(0,0,0,.15);
  transition: all .25s cubic-bezier(0.2, 0, 0, 1) !important;
  padding: 0;
  overflow: hidden;
}
.fab-primary:active { transform: scale(.95); box-shadow: 0 1px 2px rgba(0,0,0,.3); }

.fab-transition-enter-active,
.fab-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fab-transition-enter-from,
.fab-transition-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

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
  flex: 1; /* 取代 min-height: 50vh ，利用父级撑开完全居中 */
  color: var(--md-on-surface);
  text-align: center;
  padding-bottom: 10vh; /* 稍微靠上一点视觉中心更好看 */
}
.empty-icon-wrapper {
  width: 80px; height: 80px;
  background: var(--md-surface-container-highest);
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
  color: var(--md-primary);
  margin-bottom: 8px;
}
.empty-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}
.empty-hint { 
  font-size: 14px; 
  color: var(--md-on-surface-variant);
  margin: 0 0 16px 0;
}
.empty-cta {
  border-radius: 20px;
  padding: 0 24px;
}

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
  transition: all .3s cubic-bezier(0.2, 0, 0, 1);
  transform-origin: top center;
}
.search-expand-enter-from, .search-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
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
