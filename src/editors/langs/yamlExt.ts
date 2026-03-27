import { StreamLanguage } from '@codemirror/language'
// @ts-ignore
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import { linter, type Diagnostic } from '@codemirror/lint'
import { load as parseYAML } from 'js-yaml'
import type { Extension } from '@codemirror/state'

function yamlLinter() {
  return (view: import('@codemirror/view').EditorView): Diagnostic[] => {
    const text = view.state.doc.toString()
    if (!text.trim()) return []
    try {
      parseYAML(text)
      return []
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'mark' in e) {
        const mark = (e as { mark: { position: number; line: number } }).mark
        const pos = Math.min(mark.position, text.length - 1)
        const msg = e instanceof Error ? e.message : String(e)
        return [{ from: pos, to: pos + 1, severity: 'error', message: msg }]
      }
      return [{ from: 0, to: 0, severity: 'error', message: String(e) }]
    }
  }
}

const YAML_SNIPPETS = [
  { label: 'key: value', type: 'text', detail: '键值对' },
  { label: 'key:\n  - item', type: 'text', detail: '列表' },
  { label: 'key:\n  nested: value', type: 'text', detail: '嵌套对象' },
  { label: '---', type: 'text', detail: '文档开始' },
  { label: '...', type: 'text', detail: '文档结束' },
  { label: '# 注释', type: 'text', detail: '注释' },
  { label: 'true', type: 'keyword', detail: '布尔真' },
  { label: 'false', type: 'keyword', detail: '布尔假' },
  { label: 'null', type: 'keyword', detail: '空值' },
  { label: '|', type: 'text', detail: '字面量块标量' },
  { label: '>', type: 'text', detail: '折叠块标量' },
]

function yamlCompletion(context: CompletionContext) {
  const word = context.matchBefore(/[\w\-#|>]/)
  if (!word && !context.explicit) return null
  return { from: word ? word.from : context.pos, options: YAML_SNIPPETS }
}

export function buildYamlExtensions(): Extension[] {
  return [
    StreamLanguage.define(yamlMode),
    linter(yamlLinter()),
    autocompletion({ override: [yamlCompletion] }),
  ]
}
