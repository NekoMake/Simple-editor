import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SnackbarItem {
  id: string
  message: string
  action?: string
  duration?: number
}

export const useUiStore = defineStore('ui', () => {
  const snackbars = ref<SnackbarItem[]>([])
  const isBottomSheetOpen = ref(false)
  const activeBottomSheet = ref<string | null>(null)

  function showSnackbar(message: string, action?: string, duration = 3000) {
    const id = Math.random().toString(36).slice(2)
    snackbars.value.push({ id, message, action, duration })
    setTimeout(() => {
      snackbars.value = snackbars.value.filter(s => s.id !== id)
    }, duration)
  }

  function openBottomSheet(name: string) {
    activeBottomSheet.value = name
    isBottomSheetOpen.value = true
  }

  function closeBottomSheet() {
    isBottomSheetOpen.value = false
    activeBottomSheet.value = null
  }

  return {
    snackbars,
    isBottomSheetOpen,
    activeBottomSheet,
    showSnackbar,
    openBottomSheet,
    closeBottomSheet,
  }
})
