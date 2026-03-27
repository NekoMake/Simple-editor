<template>
  <button
    class="icon-btn"
    :class="[variant && `icon-btn-${variant}`, { 'icon-btn-selected': selected }]"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="emit('click', $event)"
    @pointerdown="startRipple"
  >
    <span class="ripple-container" ref="rippleEl"></span>
    <MdIcon :name="icon" :size="iconSize" :filled="selected" />
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MdIcon from './MdIcon.vue'

defineProps<{
  icon: string
  ariaLabel?: string
  variant?: 'filled' | 'tonal' | 'outlined'
  selected?: boolean
  disabled?: boolean
  iconSize?: 'sm' | 'lg'
}>()

const emit = defineEmits<{ click: [e: MouseEvent] }>()
const rippleEl = ref<HTMLElement | null>(null)

function startRipple(e: PointerEvent) {
  const el = (e.currentTarget as HTMLElement)
  const ripple = document.createElement('span')
  const rect = el.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  ripple.style.cssText = `position:absolute;border-radius:50%;width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;background:currentColor;opacity:.12;transform:scale(0);animation:ripple .4s ease-out forwards;pointer-events:none;`
  el.appendChild(ripple)
  setTimeout(() => ripple.remove(), 500)
}
</script>

<style scoped>
.icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  border: none; cursor: pointer; background: transparent;
  color: var(--md-on-surface-variant);
  position: relative; overflow: hidden;
  transition: background .15s;
}
.icon-btn:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
.icon-btn:active { background: color-mix(in srgb, currentColor 12%, transparent); }
.icon-btn:disabled { opacity: .38; pointer-events: none; }
.icon-btn-filled { background: var(--md-primary); color: var(--md-on-primary); }
.icon-btn-tonal { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
.icon-btn-outlined { border: 1px solid var(--md-outline); }
.icon-btn-selected { color: var(--md-primary); }
.ripple-container { position: absolute; inset: 0; pointer-events: none; }
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
</style>
