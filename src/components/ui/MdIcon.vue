<template>
  <span class="icon" :class="[size && `icon-${size}`, filled && 'filled']">{{ name }}</span>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  size?: 'sm' | 'lg' | 'xl'
  filled?: boolean
}>()
</script>

<style scoped>
.icon { font-family: 'Material Symbols Rounded'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; direction: ltr; font-size: 24px; font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
.icon.filled { font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
.icon-sm { font-size: 20px; }
.icon-lg { font-size: 28px; }
.icon-xl { font-size: 36px; }
</style>
