import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings, ReadingSettings, EditorSettings, CustomFont } from '@/types'

const DEFAULT_READING: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.9,
  fontFamily: 'var(--app-font-reading)',
  backgroundColor: '',   // 空 = 跟随主题
  textColor: '',
  pageMargin: 24,
  paragraphSpacing: 0.8,
  preset: 'white',
}

const DEFAULT_EDITOR: EditorSettings = {
  fontSize: 16,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  fontFamily: 'var(--app-font-sans)',
}

export const useSettingsStore = defineStore('settings', () => {
  const reading = ref<ReadingSettings>({ ...DEFAULT_READING })
  const editor = ref<EditorSettings>({ ...DEFAULT_EDITOR })
  const customFonts = ref<CustomFont[]>([])
  const homeBackgroundImage = ref<string>('')  // 首页背景图

  function updateReading(patch: Partial<ReadingSettings>) {
    Object.assign(reading.value, patch)
  }

  function resetReading() {
    reading.value = { ...DEFAULT_READING }
  }

  function updateEditor(patch: Partial<EditorSettings>) {
    Object.assign(editor.value, patch)
  }

  function addFont(font: CustomFont) {
    if (!customFonts.value.find(f => f.name === font.name)) {
      customFonts.value.push(font)
    }
  }

  function removeFont(name: string) {
    customFonts.value = customFonts.value.filter(f => f.name !== name)
  }

  function setHomeBackgroundImage(imageUrl: string) {
    homeBackgroundImage.value = imageUrl
  }

  return {
    reading,
    editor,
    customFonts,
    homeBackgroundImage,
    updateReading,
    resetReading,
    updateEditor,
    addFont,
    removeFont,
    setHomeBackgroundImage,
  }
}, {
  persist: {
    key: 'simpleeditor-settings',
    storage: localStorage,
  },
})
