<template>
  <div class="color-picker">
    <div
      ref="svPanelRef"
      class="sv-panel"
      :style="{ '--hue-color': hueColor }"
      @pointerdown="startSvDrag"
    >
      <div
        class="sv-cursor"
        :style="{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: currentHex }"
      ></div>
    </div>

    <div class="hue-row">
      <input
        class="hue-slider"
        type="range"
        min="0"
        max="360"
        :value="Math.round(hsv.h)"
        @input="onHueInput"
        aria-label="调整色相"
      />
    </div>

    <div class="picker-footer">
      <div class="preview-chip" :style="{ background: currentHex }" aria-hidden="true"></div>
      <input
        class="hex-input"
        :value="currentHex"
        @input="onHexInput"
        @blur="onHexBlur"
        spellcheck="false"
        aria-label="输入十六进制颜色"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const svPanelRef = ref<HTMLElement | null>(null)
const hsv = reactive({
  h: 185,
  s: 1,
  v: 0.43,
})

const hexDraft = ref(normalizeHex(props.modelValue))
let syncingFromModel = false

const hueColor = computed(() => hsvToHex(hsv.h, 1, 1))
const currentHex = computed(() => hsvToHex(hsv.h, hsv.s, hsv.v))

watch(
  () => props.modelValue,
  (value) => {
    const normalized = normalizeHex(value)
    const rgb = hexToRgb(normalized)
    const next = rgbToHsv(rgb.r, rgb.g, rgb.b)
    syncingFromModel = true
    hsv.h = next.h
    hsv.s = next.s
    hsv.v = next.v
    hexDraft.value = normalized
    syncingFromModel = false
  },
  { immediate: true },
)

watch(
  () => [hsv.h, hsv.s, hsv.v],
  () => {
    if (syncingFromModel) return
    const nextHex = currentHex.value
    hexDraft.value = nextHex
    emit('update:modelValue', nextHex)
  },
)

function onHueInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  hsv.h = clamp(value, 0, 360)
}

function startSvDrag(event: PointerEvent) {
  updateSvByPointer(event)
  const onMove = (moveEvent: PointerEvent) => updateSvByPointer(moveEvent)
  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function updateSvByPointer(event: PointerEvent) {
  if (!svPanelRef.value) return
  const rect = svPanelRef.value.getBoundingClientRect()
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)

  hsv.s = x
  hsv.v = 1 - y
}

function onHexInput(event: Event) {
  hexDraft.value = (event.target as HTMLInputElement).value.toUpperCase()
}

function onHexBlur() {
  const normalized = normalizeHex(hexDraft.value)
  const rgb = hexToRgb(normalized)
  const next = rgbToHsv(rgb.r, rgb.g, rgb.b)

  syncingFromModel = true
  hsv.h = next.h
  hsv.s = next.s
  hsv.v = next.v
  hexDraft.value = normalized
  syncingFromModel = false

  emit('update:modelValue', normalized)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', updateSvByPointer)
})

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(input: string): string {
  const raw = input.trim().replace('#', '')

  if (/^[0-9A-Fa-f]{3}$/.test(raw)) {
    const expanded = raw
      .split('')
      .map((c) => c + c)
      .join('')
    return `#${expanded.toUpperCase()}`
  }

  if (/^[0-9A-Fa-f]{6}$/.test(raw)) {
    return `#${raw.toUpperCase()}`
  }

  return '#006B71'
}

function hexToRgb(hex: string) {
  const cleaned = normalizeHex(hex).slice(1)
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  }
}

function rgbToHsv(r: number, g: number, b: number) {
  const nr = r / 255
  const ng = g / 255
  const nb = b / 255

  const max = Math.max(nr, ng, nb)
  const min = Math.min(nr, ng, nb)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === nr) h = ((ng - nb) / delta) % 6
    else if (max === ng) h = (nb - nr) / delta + 2
    else h = (nr - ng) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : delta / max
  const v = max

  return { h, s, v }
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s
  const hh = h / 60
  const x = c * (1 - Math.abs((hh % 2) - 1))

  let r1 = 0
  let g1 = 0
  let b1 = 0

  if (hh >= 0 && hh < 1) {
    r1 = c
    g1 = x
  } else if (hh >= 1 && hh < 2) {
    r1 = x
    g1 = c
  } else if (hh >= 2 && hh < 3) {
    g1 = c
    b1 = x
  } else if (hh >= 3 && hh < 4) {
    g1 = x
    b1 = c
  } else if (hh >= 4 && hh < 5) {
    r1 = x
    b1 = c
  } else {
    r1 = c
    b1 = x
  }

  const m = v - c
  const r = Math.round((r1 + m) * 255)
  const g = Math.round((g1 + m) * 255)
  const b = Math.round((b1 + m) * 255)

  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
</script>

<style scoped>
.color-picker {
  display: grid;
  gap: 14px;
}

.sv-panel {
  position: relative;
  height: 180px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--md-on-surface) 18%, transparent);
  background:
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, var(--hue-color));
  touch-action: none;
}

.sv-cursor {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
  transform: translate(-50%, -50%);
}

.hue-row {
  padding: 0 2px;
}

.hue-slider {
  width: 100%;
  margin: 0;
  appearance: none;
  height: 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--md-on-surface) 18%, transparent);
  background: linear-gradient(
    to right,
    #ff0000,
    #ffff00,
    #00ff00,
    #00ffff,
    #0000ff,
    #ff00ff,
    #ff0000
  );
}

.hue-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.hue-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.picker-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-chip {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--md-on-surface) 18%, transparent);
  flex: 0 0 auto;
}

.hex-input {
  width: 120px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--md-outline);
  background: var(--md-surface);
  color: var(--md-on-surface);
  padding: 0 10px;
  font-size: 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  text-transform: uppercase;
}

.hex-input:focus {
  outline: none;
  border-color: var(--md-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-primary) 26%, transparent);
}
</style>
