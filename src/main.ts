import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import './styles/global.css'
import './styles/components.css'

const pinia = createPinia()
pinia.use(piniaPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

// 动态切换 highlight.js 暗色主题
let hljsDarkLink: HTMLLinkElement | null = null
async function syncHljsTheme(dark: boolean) {
  if (dark) {
    if (!hljsDarkLink) {
      hljsDarkLink = document.createElement('link')
      hljsDarkLink.rel = 'stylesheet'
      hljsDarkLink.id = 'hljs-dark'
    }
    // Vite 会处理这个动态 import
    const url = new URL('highlight.js/styles/github-dark.css', import.meta.url).href
    hljsDarkLink.href = url
    document.head.appendChild(hljsDarkLink)
  } else {
    hljsDarkLink?.remove()
    hljsDarkLink = null
  }
}

// 等 pinia 初始化后再订阅
import('@/stores/theme').then(({ useThemeStore }) => {
  const themeStore = useThemeStore()
  watch(() => themeStore.isDark, syncHljsTheme, { immediate: true })
})
