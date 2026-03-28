<template>
  <div class="editor-toolbar" :class="{ 'is-tablet': isTablet }">
    <div class="toolbar-content">
      <button
        v-for="action in actions"
        :key="action.id"
        class="toolbar-button"
        :class="{ 'is-active': action.isActive?.() }"
        :title="action.label"
        @click="handleAction(action, $event)"
      >
        <div class="icon-indicator">
          <MdIcon :name="action.icon" size="sm" />
          <MdIcon v-if="action.subActions" name="arrow_drop_down" size="sm" class="dropdown-icon" />
          <span class="ripple"></span>
        </div>
        <span class="toolbar-label">{{ action.label }}</span>
      </button>
    </div>
    
    <!-- 子选项菜单 -->
    <teleport to="#app-root">
      <transition name="submenu">
        <div v-if="showSubMenu && currentSubActions" class="submenu-backdrop" @click="showSubMenu = false">
          <div class="submenu-panel" @click.stop>
            <div class="submenu-title">选择类型</div>
            <div class="submenu-actions">
              <button
                v-for="subAction in currentSubActions"
                :key="subAction.id"
                class="submenu-button"
                @click="handleSubAction(subAction, $event)"
              >
                <MdIcon :name="subAction.icon" size="sm" />
                <span>{{ subAction.label }}</span>
                <span class="ripple"></span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import MdIcon from './MdIcon.vue'
import type { ToolbarAction } from '@/types/toolbar'

const props = defineProps<{
  actions: ToolbarAction[]
}>()

const emit = defineEmits<{
  action: [action: ToolbarAction]
}>()

const windowWidth = ref(window.innerWidth)
const isTablet = computed(() => windowWidth.value >= 768)
const showSubMenu = ref(false)
const currentSubActions = ref<ToolbarAction[] | null>(null)

function handleAction(action: ToolbarAction, event: MouseEvent) {
  // 创建涟漪效果
  const target = event.currentTarget as HTMLButtonElement
  if (target) {
    const indicator = target.querySelector('.icon-indicator') as HTMLElement
    const ripple = target.querySelector('.ripple') as HTMLElement
    
    if (indicator && ripple) {
      // 获取点击位置相对于 indicator 的坐标
      const rect = indicator.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // 设置涟漪起始位置
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      
      // 触发涟漪动画
      ripple.classList.remove('ripple-animate')
      void ripple.offsetWidth // 强制重排，重置动画
      ripple.classList.add('ripple-animate')
    }
    
    // 稍后移除按钮焦点
    setTimeout(() => target.blur(), 100)
  }
  
  if (action.subActions && action.subActions.length > 0) {
    // 有子选项，显示选择菜单
    currentSubActions.value = action.subActions
    showSubMenu.value = true
  } else {
    // 直接执行操作
    emit('action', action)
  }
}

function handleSubAction(subAction: ToolbarAction, event: MouseEvent) {
  // 创建涟漪效果
  const target = event.currentTarget as HTMLButtonElement
  if (target) {
    const ripple = target.querySelector('.ripple') as HTMLElement
    
    if (ripple) {
      // 获取点击位置相对于按钮的坐标
      const rect = target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // 设置涟漪起始位置
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      
      // 触发涟漪动画
      ripple.classList.remove('ripple-animate')
      void ripple.offsetWidth // 强制重排，重置动画
      ripple.classList.add('ripple-animate')
    }
  }
  
  // 延迟关闭菜单，让涟漪效果可见
  setTimeout(() => {
    showSubMenu.value = false
    emit('action', subAction)
  }, 150)
}

function updateWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<style scoped>
.editor-toolbar {
  position: relative;
  background: var(--md-surface);
  padding: 0;
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  box-shadow: none;
  border: none;
  border-top: 1px solid var(--md-outline-variant);
  border-radius: 0;
  width: 100%;
  height: 56px;
  flex-shrink: 0;
}

.editor-toolbar.is-tablet {
  order: -1;
  width: 80px;
  height: 100%;
  flex-direction: column;
  padding: 12px 0;
  border-top: none;
  border-right: 1px solid var(--md-outline-variant);
  background: var(--md-surface);
  overflow-x: hidden;
  overflow-y: auto;
}

.toolbar-content {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-direction: row;
  width: 100%;
  justify-content: flex-start;
  padding: 0 8px;
}

.is-tablet .toolbar-content {
  flex-direction: column;
  justify-content: flex-start;
  padding: 0;
  gap: 12px;
}

.toolbar-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--md-on-surface-variant);
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
}

.is-tablet .toolbar-button {
  width: 100%;
  height: 64px;
  min-width: unset;
  min-height: unset;
  padding: 0 12px;
}

.icon-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
  border-radius: 16px;
  transition: background-color 0.2s, color 0.2s;
  position: relative;
  overflow: hidden;
}

.is-tablet .icon-indicator {
  width: 56px;
}

/* 只在真正支持 hover 的设备上应用 hover 样式（避免移动端触摸后粘滞） */
@media (hover: hover) and (pointer: fine) {
  .toolbar-button:hover .icon-indicator {
    background: var(--md-surface-container-highest);
  }
}

.toolbar-button:active .icon-indicator {
  background: var(--md-surface-container-highest);
}

.toolbar-button:focus {
  outline: none;
}

.toolbar-button:focus-visible .icon-indicator {
  outline: 2px solid var(--md-primary);
  outline-offset: 2px;
}

.toolbar-button.is-active .icon-indicator {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
}

.toolbar-button.is-active {
  color: var(--md-on-surface);
  font-weight: 500;
}

.toolbar-label {
  display: none;
  font-size: 12px;
  margin-top: 4px;
  line-height: 16px;
  text-align: center;
  font-family: inherit;
  white-space: nowrap;
}

.is-tablet .toolbar-label {
  display: block;
}

.dropdown-icon {
  position: absolute;
  bottom: 0px;
  right: 0px;
  opacity: 0.7;
  transform: scale(0.6);
}

/* 涟漪效果 */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0);
  width: 100%;
  height: 100%;
}

.ripple-animate {
  animation: ripple-animation 0.6s ease-out;
}

@keyframes ripple-animation {
  0% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.5);
  }
}

/* 子菜单按钮的涟漪效果，扩散范围更大 */
.submenu-button .ripple {
  animation: ripple-animation-large 0.6s ease-out;
}

@keyframes ripple-animation-large {
  0% {
    opacity: 0.25;
    transform: translate(-50%, -50%) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(3);
  }
}

/* 子菜单样式 */
.submenu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 768px) {
  .submenu-backdrop {
    align-items: center;
  }
}

.submenu-panel {
  background: var(--md-surface-container-low);
  border-radius: 28px;
  padding: 24px;
  max-width: 400px;
  width: calc(100% - 32px);
  max-height: 70vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .submenu-panel {
    border-radius: 28px;
  }
}

.submenu-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--md-on-surface);
  margin-bottom: 16px;
}

.submenu-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 480px) {
  .submenu-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

.submenu-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px;
  border: none;
  border-radius: var(--md-shape-lg);
  background: var(--md-surface-container);
  color: var(--md-on-surface);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: background-color 0.2s;
  min-height: 80px;
  position: relative;
  overflow: hidden;
}

.submenu-button:active {
  background: var(--md-surface-container-highest);
}

.submenu-button:focus {
  outline: none;
}

.submenu-button:focus-visible {
  outline: 2px solid var(--md-primary);
  outline-offset: 2px;
}

.submenu-enter-active,
.submenu-leave-active {
  transition: opacity 0.25s, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
}

.submenu-enter-from .submenu-panel,
.submenu-leave-to .submenu-panel {
  transform: translateY(20px);
}

/* 移动端滚动条优化 */
.editor-toolbar::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}

.editor-toolbar::-webkit-scrollbar-track {
  background: transparent;
}

.editor-toolbar::-webkit-scrollbar-thumb {
  background: var(--md-outline-variant);
  border-radius: 2px;
}
</style>
