<template>
  <div class="top-bar" :class="{ scrolled }">
    <IconButton v-if="showBack" icon="arrow_back" aria-label="返回" @click="emit('back')" />
    <slot name="leading" />
    <div class="bar-title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="bar-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconButton from './IconButton.vue'

defineProps<{
  title?: string
  showBack?: boolean
  scrolled?: boolean
}>()

const emit = defineEmits<{ back: [] }>()
</script>

<style scoped>
.top-bar {
  display: flex; align-items: center;
  gap: 4px;
  min-height: 64px;
  padding: env(safe-area-inset-top, 0) 4px 0 4px;
  background: var(--md-surface);
  position: sticky; top: 0; z-index: 10;
  transition: background .2s, box-shadow .2s;
}
.top-bar.scrolled {
  background: var(--md-surface-container);
  box-shadow: 0 1px 2px rgba(0,0,0,.3),0 1px 3px 1px rgba(0,0,0,.15);
}
.bar-title {
  flex: 1; padding: 0 8px;
  font-size: 22px; font-weight: 500; line-height: 1.3;
  color: var(--md-on-surface);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bar-actions { display: flex; gap: 0; flex-shrink: 0; }
</style>
