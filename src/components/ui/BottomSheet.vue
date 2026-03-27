<template>
  <teleport to="body">
    <transition name="sheet">
      <div v-if="modelValue" class="sheet-backdrop" @click.self="emit('update:modelValue', false)">
        <div class="sheet-panel" role="dialog" :aria-label="title">
          <div class="sheet-handle"></div>
          <div v-if="title" class="sheet-title">{{ title }}</div>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; title?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
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
}
.sheet-handle {
  width: 32px; height: 4px;
  background: var(--md-outline-variant);
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
