import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeSettings, ThemeColorScheme } from '@/types'

// M3 主题色板定义
const COLOR_SCHEMES: Record<ThemeColorScheme, { primary: string; primaryContainer: string; onPrimary: string; onPrimaryContainer: string }> = {
  teal: {
    primary: '#006B71',
    primaryContainer: '#9EEFFF',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#001F24',
  },
  purple: {
    primary: '#6750A4',
    primaryContainer: '#EADDFF',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#21005D',
  },
  blue: {
    primary: '#0061A4',
    primaryContainer: '#D1E4FF',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#001D36',
  },
  green: {
    primary: '#2E7D32',
    primaryContainer: '#A5D6A7',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#002106',
  },
  orange: {
    primary: '#B25000',
    primaryContainer: '#FFDBC8',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#391400',
  },
  rose: {
    primary: '#B0004E',
    primaryContainer: '#FFD9E2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#3F0019',
  },
  custom: {
    primary: '#006B71',
    primaryContainer: '#9EEFFF',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#001F24',
  },
}

export const useThemeStore = defineStore('theme', () => {
  const settings = ref<ThemeSettings>({
    mode: 'system',
    colorScheme: 'teal',
    customPrimaryHex: '#006B71',
  })

  const isDark = ref(false)

  function applySystemTheme() {
    if (settings.value.mode === 'system') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = settings.value.mode === 'dark'
    }
  }

  function setMode(mode: 'light' | 'dark' | 'system') {
    settings.value.mode = mode
    applySystemTheme()
  }

  function setColorScheme(scheme: ThemeColorScheme, customHex?: string) {
    settings.value.colorScheme = scheme
    if (customHex) settings.value.customPrimaryHex = customHex
  }

  // 生成需要注入到 :root 的 CSS 变量（覆盖颜色部分）
  const cssVariables = computed<Record<string, string>>(() => {
    const scheme = settings.value.colorScheme
    let colors = COLOR_SCHEMES[scheme]

    if (scheme === 'custom') {
      const hex = settings.value.customPrimaryHex
      colors = {
        primary: hex,
        primaryContainer: hex + '33',
        onPrimary: '#ffffff',
        onPrimaryContainer: '#001F24',
      }
    }

    return {
      '--md-primary': colors.primary,
      '--md-on-primary': colors.onPrimary,
      '--md-primary-container': colors.primaryContainer,
      '--md-on-primary-container': colors.onPrimaryContainer,
    }
  })

  return {
    settings,
    isDark,
    applySystemTheme,
    setMode,
    setColorScheme,
    cssVariables,
    COLOR_SCHEMES,
  }
}, {
  persist: {
    key: 'simpleeditor-theme',
    storage: localStorage,
    pick: ['settings'],
  },
})
