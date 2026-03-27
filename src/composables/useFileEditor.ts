import { ref } from 'vue'
import { useFileStore } from '@/stores/files'
import { useUiStore } from '@/stores/ui'
import type { AppFile } from '@/types'
import { debounce } from '@/utils/helpers'

export function useFileEditor(file: AppFile) {
  const fileStore = useFileStore()
  const uiStore = useUiStore()

  const content = ref('')
  const isDirty = ref(false)
  const isSaving = ref(false)
  const isLoading = ref(true)

  async function load() {
    isLoading.value = true
    try {
      content.value = await fileStore.readContent(file)
    } catch {
      uiStore.showSnackbar('文件加载失败')
    } finally {
      isLoading.value = false
    }
  }

  async function save() {
    if (!isDirty.value) return
    isSaving.value = true
    try {
      await fileStore.writeContent(file, content.value)
      isDirty.value = false
      uiStore.showSnackbar('已保存')
    } catch {
      uiStore.showSnackbar('保存失败，请重试')
    } finally {
      isSaving.value = false
    }
  }

  const autoSave = debounce(save, 1500)

  function onChange(newContent: string) {
    content.value = newContent
    isDirty.value = true
    autoSave()
  }

  return { content, isDirty, isSaving, isLoading, load, save, onChange }
}
