<template>
  <div class="font-view">
    <TopAppBar title="自定义字体" show-back @back="router.back()" />

    <div class="font-body">
      <p class="hint-text">支持安装 TTF 格式字体文件，安装后可在编辑器和阅读设置中选用。</p>

      <!-- 已安装字体 -->
      <div class="section-header">已安装字体 ({{ fonts.length }})</div>

      <div v-if="fonts.length === 0" class="empty-hint">
        <MdIcon name="font_download_off" size="xl" />
        <p>还没有安装字体</p>
      </div>

      <div v-else class="font-list">
        <div v-for="font in fonts" :key="font.name" class="font-item">
          <div class="font-preview" :style="{ fontFamily: font.name }">
            AaBbCc 中文字体预览 123
          </div>
          <div class="font-meta">
            <span class="font-name">{{ font.name }}</span>
            <span class="font-badge" :class="{ mono: font.isMonospace }">
              {{ font.isMonospace ? '等宽' : '衬线/无衬线' }}
            </span>
          </div>
          <IconButton icon="delete_outline" aria-label="删除字体" @click="removeFont(font.name)" />
        </div>
      </div>

      <!-- 安装新字体 -->
      <div class="section-header">安装新字体</div>

      <div class="install-card">
        <div class="text-field">
          <label>字体名称（用于选择时显示）</label>
          <input v-model="newFontName" placeholder="如：霞鹜文楷" />
        </div>
        <div class="toggle-row">
          <span>等宽字体（代码用）</span>
          <button class="toggle-btn" :class="{ on: isMonospace }" @click="isMonospace = !isMonospace">
            {{ isMonospace ? '是' : '否' }}
          </button>
        </div>
        <MdButton variant="tonal" leading-icon="upload_file" @click="pickFontFile" :disabled="!newFontName.trim()">
          选择 TTF 文件并安装
        </MdButton>
        <input ref="fileInput" type="file" accept=".ttf" style="display:none" @change="onFileChange" />
      </div>
    </div>

    <SnackbarHost />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TopAppBar from '@/components/ui/TopAppBar.vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import MdButton from '@/components/ui/MdButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import SnackbarHost from '@/components/ui/SnackbarHost.vue'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'
import { useFontLoader } from '@/composables/useFontLoader'

const router = useRouter()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()
const { installFont, uninstallFont } = useFontLoader()

const fonts = computed(() => settingsStore.customFonts)
const newFontName = ref('')
const isMonospace = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function pickFontFile() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !newFontName.value.trim()) return
  try {
    const base64 = await fileToBase64(file)
    await installFont(newFontName.value.trim(), base64, isMonospace.value)
    uiStore.showSnackbar(`字体「${newFontName.value}」已安装`)
    newFontName.value = ''
    isMonospace.value = false
  } catch {
    uiStore.showSnackbar('字体安装失败')
  }
  // 重置 input
  if (fileInput.value) fileInput.value.value = ''
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1]
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function removeFont(name: string) {
  await uninstallFont(name)
  uiStore.showSnackbar(`字体「${name}」已卸载`)
}
</script>

<style scoped>
.font-view { display: flex; flex-direction: column; height: 100%; background: var(--md-surface); }
.font-body { flex: 1; overflow-y: auto; padding: 0 16px 40px; }
.hint-text { font-size: 14px; color: var(--md-on-surface-variant); padding: 12px 0; line-height: 1.5; }
.section-header {
  font-size: 12px; font-weight: 600; letter-spacing: .5px;
  color: var(--md-primary); text-transform: uppercase;
  padding: 20px 0 8px;
}
.empty-hint {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 32px;
  color: var(--md-on-surface-variant);
}
.font-list { display: flex; flex-direction: column; gap: 8px; }
.font-item {
  display: flex; align-items: center; gap: 12px;
  background: var(--md-surface-container-low);
  border-radius: 12px; padding: 12px 16px;
}
.font-preview { font-size: 18px; flex: 1; color: var(--md-on-surface); }
.font-meta { display: flex; flex-direction: column; gap: 4px; }
.font-name { font-size: 12px; color: var(--md-on-surface-variant); }
.font-badge {
  font-size: 11px; padding: 2px 6px; border-radius: 4px;
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}
.font-badge.mono {
  background: var(--md-tertiary-container);
  color: var(--md-on-tertiary-container);
}
.install-card {
  background: var(--md-surface-container-low);
  border-radius: 16px; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}
.text-field { display: flex; flex-direction: column; gap: 6px; }
.text-field label { font-size: 12px; color: var(--md-on-surface-variant); }
.text-field input {
  background: var(--md-surface-container-highest);
  border: none; border-radius: 8px; padding: 12px 16px;
  font-size: 16px; color: var(--md-on-surface); outline: 2px solid transparent;
  font-family: inherit;
}
.text-field input:focus { outline-color: var(--md-primary); }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 16px; color: var(--md-on-surface);
}
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
</style>
