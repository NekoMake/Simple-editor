<template>
  <teleport to="body">
    <transition name="dialog-anim">
      <div v-if="modelValue" class="dialog-backdrop" @click.self="onBackdropClick">
        <div class="dialog-box" role="dialog" :aria-label="title">
          <div v-if="icon" class="dialog-icon"><MdIcon :name="icon" size="lg" /></div>
          <div v-if="title" class="dialog-title">{{ title }}</div>
          <div v-if="$slots.default" class="dialog-body"><slot /></div>
          <div v-if="$slots.actions" class="dialog-actions"><slot name="actions" /></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import MdIcon from './MdIcon.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  icon?: string
  dismissible?: boolean
}>(), { dismissible: true })

const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

function onBackdropClick() {
  if (props.dismissible) emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  z-index: 110;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.dialog-box {
  background: var(--md-surface-container-high);
  border-radius: 28px;
  padding: 24px;
  min-width: 280px; max-width: 560px; width: 100%;
  max-height: 80dvh; overflow-y: auto;
}
.dialog-icon {
  text-align: center; margin-bottom: 16px;
  color: var(--md-secondary);
}
.dialog-title {
  font-size: 24px; font-weight: 400; text-align: center;
  color: var(--md-on-surface); margin-bottom: 16px;
}
.dialog-body {
  font-size: 14px; line-height: 1.43;
  color: var(--md-on-surface-variant);
  margin-bottom: 24px;
}
.dialog-actions {
  display: flex; justify-content: flex-end; gap: 8px;
}
.dialog-anim-enter-active, .dialog-anim-leave-active { transition: opacity .2s; }
.dialog-anim-enter-from, .dialog-anim-leave-to { opacity: 0; }
.dialog-anim-enter-from .dialog-box, .dialog-anim-leave-to .dialog-box { transform: scale(.9); }
</style>
