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
import { useThemeStore } from '@/stores/theme'
import { useFileStore } from '@/stores/files'
import { useFontLoader } from '@/composables/useFontLoader'

const themeStore = useThemeStore()
const fileStore = useFileStore()
const { loadCustomFonts } = useFontLoader()

const appClasses = computed(() => ({
  'dark': themeStore.isDark,
}))

const appStyle = computed(() => themeStore.cssVariables)

onMounted(async () => {
  themeStore.applySystemTheme()
  await fileStore.init()
  await loadCustomFonts()
})

watch(() => themeStore.settings.mode, () => {
  themeStore.applySystemTheme()
})
</script>
