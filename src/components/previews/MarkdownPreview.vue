<template>
  <div class="md-preview" ref="mdContainer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, ref } from 'vue'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import mermaid from 'mermaid'

const props = defineProps<{ content: string }>()

mermaid.initialize({ startOnLoad: false, theme: 'default' })

const mdContainer = ref<HTMLElement | null>(null)

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang === 'mermaid') {
        return code // Do not highlight mermaid
      }
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

marked.setOptions({ gfm: true, breaks: true })

// 覆盖默认的代码块渲染，如果是 mermaid 直接输出 div 而不被 pre/code 包裹
const renderer = {
  code({ text, lang }: { text: string; lang?: string }) {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${text}</div>`
    }
    return false // fallback to default
  }
}
marked.use({ renderer })

const renderedHtml = computed(() => {
  const raw = marked.parse(props.content) as string
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ['iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
})

watch(renderedHtml, async () => {
  await nextTick()
  if (mdContainer.value) {
    const nodes = mdContainer.value.querySelectorAll('.mermaid')
    for (const node of nodes) {
      if (node.getAttribute('data-processed')) continue
      try {
        const text = node.textContent || ''
        // Create a unique ID for the mermaid diagram
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        const { svg } = await mermaid.render(id, text)
        node.innerHTML = svg
        node.setAttribute('data-processed', 'true')
      } catch (e: any) {
        console.error('Mermaid render error', e)
        node.innerHTML = `<div class="error-msg" style="color:var(--md-error);border:1px solid var(--md-error);padding:10px;border-radius:4px;font-family:var(--app-font-mono);white-space:pre-wrap;">Diagram error: ${e.message || e}</div>`
      }
    }
  }
}, { immediate: true })
</script>

<style>
/* 全局样式：因为 v-html 内容无法用 scoped */
.md-preview {
  padding: 20px 24px;
  overflow-y: auto;
  height: 100%;
  color: var(--md-on-surface);
  font-size: 16px;
  line-height: 1.75;
  font-family: var(--app-font-reading);
}
.md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4 {
  color: var(--md-on-surface);
  margin: 1.2em 0 .5em;
  font-weight: 600;
  line-height: 1.3;
}
.md-preview h1 { font-size: 2em; border-bottom: 1px solid var(--md-outline-variant); padding-bottom: .3em; }
.md-preview h2 { font-size: 1.5em; border-bottom: 1px solid var(--md-outline-variant); padding-bottom: .2em; }
.md-preview h3 { font-size: 1.25em; }
.md-preview p { margin: .85em 0; }
.md-preview a { color: var(--md-primary); text-decoration: underline; }
.md-preview code {
  background: var(--md-surface-container-high);
  border-radius: 4px; padding: 2px 6px;
  font-family: var(--app-font-mono);
  font-size: .9em;
}
.md-preview pre {
  background: var(--md-surface-container-high);
  border-radius: 12px; padding: 16px;
  overflow-x: auto; margin: 1em 0;
}
.md-preview pre code { background: none; padding: 0; font-size: .875em; }
.md-preview blockquote {
  border-left: 4px solid var(--md-primary);
  margin: 1em 0; padding: .5em 1em;
  color: var(--md-on-surface-variant);
  background: color-mix(in srgb, var(--md-primary) 6%, transparent);
  border-radius: 0 8px 8px 0;
}
.md-preview table { border-collapse: collapse; width: 100%; margin: 1em 0; }
.md-preview th,.md-preview td {
  border: 1px solid var(--md-outline-variant);
  padding: 8px 12px; text-align: left;
}
.md-preview th { background: var(--md-surface-container); font-weight: 600; }
.md-preview tr:nth-child(even) { background: var(--md-surface-container-low); }
.md-preview ul,.md-preview ol { padding-left: 1.5em; margin: .5em 0; }
.md-preview li { margin: .25em 0; }
.md-preview li input[type=checkbox] { margin-right: 6px; }
.md-preview hr { border: none; border-top: 1px solid var(--md-outline-variant); margin: 1.5em 0; }
.md-preview img { max-width: 100%; border-radius: 8px; }
/* Highlight.js 主题覆盖 */
.hljs { background: transparent !important; }
</style>
