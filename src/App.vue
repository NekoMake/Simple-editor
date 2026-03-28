<template>
  <div id="app-root" :class="appClasses" :style="appStyle">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition as string || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { App as CapacitorApp } from '@capacitor/app'
import { Filesystem, Encoding } from '@capacitor/filesystem'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useFileStore } from '@/stores/files'
import { useFontLoader } from '@/composables/useFontLoader'

const themeStore = useThemeStore()
const fileStore = useFileStore()
const router = useRouter()
const { loadCustomFonts } = useFontLoader()

const appClasses = computed(() => ({
  'dark': themeStore.isDark,
}))

const appStyle = computed(() => themeStore.cssVariables)

onMounted(async () => {
  themeStore.applySystemTheme()
  await fileStore.init()
  await loadCustomFonts()

  // 监听外部打开文件
  CapacitorApp.addListener('appUrlOpen', async (data) => {
    const url = data.url
    if (url && (url.startsWith('content://') || url.startsWith('file://'))) {
      try {
        console.log('应用被外文件唤起:', url)
        
        let fileName = 'Imported-File.md'
        // 尝试从 URI 推断文件名
        const urlParts = url.split('/')
        const lastPart = urlParts[urlParts.length - 1]
        // 解码、去掉 query 参数，再去掉 "primary:" 前缀（Android content URI 常见格式）
        const decodedPart = decodeURIComponent(lastPart).split('?')[0].replace(/^.*:/, '')
        if (decodedPart && (decodedPart.endsWith('.md') || decodedPart.endsWith('.txt'))) {
          fileName = decodedPart
        }

        const contentResponse = await Filesystem.readFile({ path: url, encoding: Encoding.UTF8 })
        const textContent = contentResponse.data as string
        
        // 导入文件
        const appFile = await fileStore.importWebContent(fileName, textContent)
        
        // 跳转到编辑器
        if (appFile && appFile.id) {
          router.push(`/editor/${appFile.id}`)
        }
      } catch (error) {
        console.error('读取外链文件失败：', error)
      }
    }
  })
})

watch(() => themeStore.settings.mode, () => {
  themeStore.applySystemTheme()
})
</script>
