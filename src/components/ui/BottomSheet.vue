<template>
  <teleport to="#app-root">
    <transition name="sheet">
      <div v-if="modelValue" class="sheet-backdrop" @click.self="emit('update:modelValue', false)">
        <div 
          class="sheet-panel" 
          role="dialog" 
          :aria-label="title"
          :style="{ transform: dragTransform }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div class="sheet-handle"></div>
          <div v-if="title" class="sheet-title">{{ title }}</div>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{ modelValue: boolean; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

// 滑动状态
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)
const scrollTop = ref(0)

const dragTransform = computed(() => {
  if (!isDragging.value) return ''
  const delta = Math.max(0, currentY.value - startY.value)
  return `translateY(${delta}px)`
})

function onTouchStart(e: TouchEvent) {
  const target = e.target as HTMLElement
  const panel = e.currentTarget as HTMLElement
  
  // 记录面板的滚动位置
  scrollTop.value = panel.scrollTop
  
  // 只在顶部或拖动手柄时允许滑动关闭
  if (scrollTop.value === 0 || target.classList.contains('sheet-handle')) {
    startY.value = e.touches[0].clientY
    currentY.value = startY.value
    isDragging.value = true
  }
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  
  const panel = e.currentTarget as HTMLElement
  const newScrollTop = panel.scrollTop
  
  // 如果内容开始滚动，取消拖动
  if (newScrollTop > 0 && scrollTop.value === 0) {
    isDragging.value = false
    return
  }
  
  currentY.value = e.touches[0].clientY
  const delta = currentY.value - startY.value
  
  // 只允许向下滑动
  if (delta > 0) {
    e.preventDefault()
  } else {
    isDragging.value = false
  }
}

function onTouchEnd() {
  if (!isDragging.value) return
  
  const delta = currentY.value - startY.value
  const threshold = 100 // 滑动 100px 以上才关闭
  
  if (delta > threshold) {
    emit('update:modelValue', false)
  }
  
  isDragging.value = false
  currentY.value = 0
  startY.value = 0
}
</script>

<style scoped>
.sheet-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  z-index: 100;
  display: flex; align-items: flex-end;
}
.sheet-panel {
  width: 100%; background: var(--md-surface-container-low);
  border-radius: 28px 28px 0 0;
  padding: 12px 24px max(24px, env(safe-area-inset-bottom));
  max-height: 85dvh; overflow-y: auto;
  transition: transform .2s ease-out;
  touch-action: pan-y;
}
.sheet-handle {
  width: 32px; height: 4px;
  background: var(--md-outline-variant);
  cursor: grab;
  touch-action: none;
  border-radius: 2px;
  margin: 0 auto 16px;
}
.sheet-title {
  font-size: 24px; font-weight: 400; line-height: 1.33;
  color: var(--md-on-surface);
  margin-bottom: 16px;
}
.sheet-enter-active, .sheet-leave-active {
  transition: opacity .28s, transform .28s cubic-bezier(.4,0,.2,1);
}
.sheet-enter-from, .sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet-panel, .sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
