<template>
  <teleport to="#app-root">
    <transition-group name="snack" tag="div" class="snack-stack">
      <div v-for="s in uiStore.snackbars" :key="s.id" class="snackbar">
        <span class="snack-msg">{{ s.message }}</span>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
const uiStore = useUiStore()
</script>

<style scoped>
.snack-stack {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; gap: 8px;
  z-index: 200; pointer-events: none;
  min-width: 280px; max-width: calc(100vw - 48px);
}
.snackbar {
  background: var(--md-inverse-surface);
  color: var(--md-inverse-on-surface);
  border-radius: 4px; padding: 14px 16px;
  font-size: 14px; line-height: 1.43;
  box-shadow: 0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.3);
  pointer-events: auto;
}
.snack-enter-active, .snack-leave-active { transition: all .2s; }
.snack-enter-from { opacity: 0; transform: translateY(8px); }
.snack-leave-to { opacity: 0; }
</style>
