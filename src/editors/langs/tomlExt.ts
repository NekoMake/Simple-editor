import { StreamLanguage } from '@codemirror/language'
// @ts-ignore
import { toml as tomlMode } from '@codemirror/legacy-modes/mode/toml'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import { linter, type Diagnostic } from '@codemirror/lint'
import { parse as parseTOML } from 'smol-toml'
import type { Extension } from '@codemirror/state'

function tomlLinter() {
  return (view: import('@codemirror/view').EditorView): Diagnostic[] => {
    const text = view.state.doc.toString()
    if (!text.trim()) return []
    try {
      parseTOML(text)
      return []
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      // 尝试解析行号
      const lineMatch = msg.match(/line (\d+)/i)
      const line = lineMatch ? parseInt(lineMatch[1]) - 1 : 0
      const lineInfo = view.state.doc.line(Math.min(line + 1, view.state.doc.lines))
      return [{
        from: lineInfo.from,
        to: lineInfo.to,
        severity: 'error',
        message: msg,
      }]
    }
  }
}

const TOML_SNIPPETS = [
  { label: 'key = "value"', type: 'text', detail: '字符串' },
  { label: 'key = 0', type: 'text', detail: '整数' },
  { label: 'key = 0.0', type: 'text', detail: '浮点数' },
  { label: 'key = true', type: 'text', detail: '布尔' },
  { label: 'key = []', type: 'text', detail: '数组' },
  { label: '[section]', type: 'text', detail: '节' },
  { label: '[[array_of_tables]]', type: 'text', detail: '表格数组' },
]

function tomlCompletion(context: CompletionContext) {
  const word = context.matchBefore(/[\w\[\]]/)
  if (!word && !context.explicit) return null
  return { from: word ? word.from : context.pos, options: TOML_SNIPPETS }
}

export function buildTomlExtensions(): Extension[] {
  return [
    StreamLanguage.define(tomlMode),
    linter(tomlLinter()),
    autocompletion({ override: [tomlCompletion] }),
  ]
}
