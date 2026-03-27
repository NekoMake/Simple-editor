<template>
  <button
    class="md-btn"
    :class="[`md-btn-${variant}`, { 'md-btn-icon-leading': leadingIcon }]"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <MdIcon v-if="leadingIcon" :name="leadingIcon" size="sm" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import MdIcon from './MdIcon.vue'

withDefaults(defineProps<{
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'
  leadingIcon?: string
  disabled?: boolean
}>(), { variant: 'filled' })

const emit = defineEmits<{ click: [e: MouseEvent] }>()
</script>

<style scoped>
.md-btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px; height: 40px; padding: 0 24px;
  border-radius: 50px; border: none; cursor: pointer;
  font-size: 14px; font-weight: 500; letter-spacing: .1px;
  font-family: inherit;
  position: relative; overflow: hidden;
  transition: box-shadow .2s;
  white-space: nowrap;
}
.md-btn:disabled { opacity: .38; pointer-events: none; }
.md-btn-icon-leading { padding-left: 16px; }
.md-btn-filled { background: var(--md-primary); color: var(--md-on-primary); }
.md-btn-tonal { background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
.md-btn-outlined { background: transparent; color: var(--md-primary); border: 1px solid var(--md-outline); }
.md-btn-text { background: transparent; color: var(--md-primary); padding: 0 12px; }
.md-btn-elevated {
  background: var(--md-surface-container-low); color: var(--md-primary);
  box-shadow: 0 1px 2px rgba(0,0,0,.3),0 1px 3px 1px rgba(0,0,0,.15);
}
.md-btn:active { opacity: .88; }
</style>
