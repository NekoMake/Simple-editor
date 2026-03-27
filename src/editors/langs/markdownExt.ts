import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'

import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'

const MD_SNIPPETS = [
  { label: '# 标题1', type: 'text', detail: 'H1' },
  { label: '## 标题2', type: 'text', detail: 'H2' },
  { label: '### 标题3', type: 'text', detail: 'H3' },
  { label: '**粗体**', type: 'text', detail: '粗体' },
  { label: '*斜体*', type: 'text', detail: '斜体' },
  { label: '~~删除线~~', type: 'text', detail: '删除线' },
  { label: '`代码`', type: 'text', detail: '行内代码' },
  { label: '```\n\n```', type: 'text', detail: '代码块' },
  { label: '> 引用', type: 'text', detail: '引用' },
  { label: '- 列表项', type: 'text', detail: '无序列表' },
  { label: '1. 列表项', type: 'text', detail: '有序列表' },
  { label: '- [ ] 待办', type: 'text', detail: '任务列表' },
  { label: '---', type: 'text', detail: '分隔线' },
  { label: '[文字](链接)', type: 'text', detail: '超链接' },
  { label: '![描述](图片URL)', type: 'text', detail: '图片' },
  { label: '| 列1 | 列2 |\n|---|---|\n| 值1 | 值2 |', type: 'text', detail: '表格' },
]

function mdCompletion(context: CompletionContext) {
  const word = context.matchBefore(/[#*`>\-\[\]!]/)
  if (!word && !context.explicit) return null
  return {
    from: word ? word.from : context.pos,
    options: MD_SNIPPETS,
  }
}

export function buildMarkdownExtensions(): Extension[] {
  return [
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),
    autocompletion({ override: [mdCompletion] }),
  ]
}
