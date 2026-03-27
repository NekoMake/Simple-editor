<template>
  <div class="chip-group" role="group" :aria-label="ariaLabel">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="filter-chip"
      :class="{ selected: modelValue === opt.value }"
      @click="emit('update:modelValue', opt.value)"
      role="radio"
      :aria-checked="modelValue === opt.value"
    >
      <MdIcon v-if="modelValue === opt.value" name="check" size="sm" />
      <span>{{ opt.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import MdIcon from './MdIcon.vue'

defineProps<{
  options: Array<{ label: string; value: string }>
  modelValue: string
  ariaLabel?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()
</script>

<style scoped>
.chip-group { display: flex; gap: 8px; flex-wrap: wrap; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 16px;
  border-radius: 8px;
  border: 1px solid var(--md-outline);
  background: transparent; color: var(--md-on-surface-variant);
  font-size: 14px; font-weight: 500; font-family: inherit;
  cursor: pointer;
  transition: background .15s, border-color .15s, color .15s;
}
.filter-chip.selected {
  background: var(--md-secondary-container);
  color: var(--md-on-secondary-container);
  border-color: transparent;
  padding-left: 8px;
}
.filter-chip:active { opacity: .8; }
</style>
