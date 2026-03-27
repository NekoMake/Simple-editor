<template>
  <div class="md-preview" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

marked.setOptions({ gfm: true, breaks: true })

const renderedHtml = computed(() => {
  const raw = marked.parse(props.content) as string
  return DOMPurify.sanitize(raw, {
    ADD_TAGS: ['iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  })
})
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
