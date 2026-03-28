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
  indigo: {
    primary: '#3F51B5',
    primaryContainer: '#C5CAE9',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#1A237E',
  },
  pink: {
    primary: '#C2185B',
    primaryContainer: '#F8BBD0',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#880E4F',
  },
  amber: {
    primary: '#FF8F00',
    primaryContainer: '#FFE082',
    onPrimary: '#000000',
    onPrimaryContainer: '#FF6F00',
  },
  cyan: {
    primary: '#0097A7',
    primaryContainer: '#B2EBF2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#006064',
  },
  red: {
    primary: '#D32F2F',
    primaryContainer: '#FFCDD2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#B71C1C',
  },
  lime: {
    primary: '#689F38',
    primaryContainer: '#DCEDC8',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#33691E',
  },
  deepPurple: {
    primary: '#512DA8',
    primaryContainer: '#D1C4E9',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#311B92',
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
    const dark = isDark.value
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
      // 让背景也染上一点点主色调
      '--md-surface': dark
        ? 'color-mix(in srgb, var(--md-primary) 3%, #1C1B1F)'
        : 'color-mix(in srgb, var(--md-primary) 4%, #FFFBFE)',
      // Surface 层级容器（由浅到深，都带一点主色调）
      '--md-surface-container-lowest': dark
        ? 'color-mix(in srgb, var(--md-primary) 5%, #1C1B1F)'
        : 'color-mix(in srgb, var(--md-primary) 5%, #FFFBFE)',
      '--md-surface-container-low': dark
        ? 'color-mix(in srgb, var(--md-primary) 8%, #1C1B1F)'
        : 'color-mix(in srgb, var(--md-primary) 7%, #FFFBFE)',
      '--md-surface-container': dark
        ? 'color-mix(in srgb, var(--md-primary) 12%, #1C1B1F)'
        : 'color-mix(in srgb, var(--md-primary) 10%, #FFFBFE)',
      '--md-surface-container-high': dark
        ? 'color-mix(in srgb, var(--md-primary) 16%, #1C1B1F)'
        : 'color-mix(in srgb, var(--md-primary) 14%, #FFFBFE)',
      '--md-surface-container-highest': dark
        ? 'color-mix(in srgb, var(--md-primary) 22%, #1C1B1F)'
        : 'color-mix(in srgb, var(--md-primary) 18%, #FFFBFE)',
      // 让按钮和背景容器跟随主色调进行轻量染色
      '--md-secondary-container': dark
        ? 'color-mix(in srgb, var(--md-primary) 34%, var(--md-surface))'
        : 'color-mix(in srgb, var(--md-primary) 25%, var(--md-surface))',
      '--md-on-secondary-container': 'var(--md-on-surface)',
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
