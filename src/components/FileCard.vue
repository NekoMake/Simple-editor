<template>
  <div class="file-card" :class="{ selected }" @click="emit('click')" @long-press="emit('longPress')">
    <div class="card-icon" :style="{ background: iconBg, color: iconColor }">
      <MdIcon :name="iconName" size="lg" />
    </div>
    <div class="card-content">
      <div class="card-name">{{ file.name }}</div>
      <div class="card-meta">{{ meta }}</div>
    </div>
    <div class="card-actions" @click.stop>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MdIcon from '@/components/ui/MdIcon.vue'
import type { AppFile } from '@/types'
import { formatDate, formatFileSize } from '@/utils/helpers'
import { MODULE_REGISTRY } from '@/editors/registry'

const props = defineProps<{
  file: AppFile
  selected?: boolean
}>()

const emit = defineEmits<{
  click: []
  longPress: []
}>()

const mod = computed(() => MODULE_REGISTRY.find(m => m.extensions.includes(props.file.format)))

const iconName = computed(() => mod.value?.icon ?? 'description')
const iconBg = computed(() => `color-mix(in srgb, var(${mod.value?.color ?? '--md-primary-container'}) 100%, transparent)`)
const iconColor = computed(() => `var(--md-on-primary-container)`)

const meta = computed(() =>
  `${formatDate(props.file.modifiedAt)}  ·  ${formatFileSize(props.file.size)}`
)
</script>

<style scoped>
.file-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; cursor: pointer;
  border-radius: 12px;
  transition: background .15s;
}
.file-card:active,
.file-card.selected {
  background: color-mix(in srgb, var(--md-on-surface) 8%, transparent);
}
.card-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-content { flex: 1; overflow: hidden; }
.card-name {
  font-size: 16px; font-weight: 400; line-height: 1.5;
  color: var(--md-on-surface);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.card-meta {
  font-size: 12px; line-height: 1.33;
  color: var(--md-on-surface-variant);
  margin-top: 2px;
}
.card-actions { flex-shrink: 0; }
</style>
