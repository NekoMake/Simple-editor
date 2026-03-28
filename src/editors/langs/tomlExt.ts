import { StreamLanguage } from '@codemirror/language'
// @ts-ignore
import { toml as tomlMode } from '@codemirror/legacy-modes/mode/toml'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import { linter, type Diagnostic } from '@codemirror/lint'
import { parse as parseTOML } from 'smol-toml'
import type { Extension } from '@codemirror/state'

/**
 * 翻译 TOML 错误信息为中文
 * 基于真实 smol-toml 错误消息的精确匹配
 */
function translateTomlError(message: string): string {
  const patterns: Array<[RegExp, string]> = [
    // 真实的 smol-toml 错误消息（带详细位置提示）
    [/^Invalid TOML document: incomplete key-value declaration: no value specified[\s\S]*/i, '缺少值'],
    [/^Invalid TOML document: only letter, numbers, dashes and underscores are allowed in keys[\s\S]*/i, '键名格式错误'],
    [/^Invalid TOML document: invalid value[\s\S]*/i, '值格式错误'],
    [/^Invalid TOML document: incomplete key-value: cannot find end of key[\s\S]*/i, '键未闭合'],
    [/^Invalid TOML document: duplicate key[\s\S]*/i, '键名重复'],
    [/^Invalid TOML document: [\s\S]*/i, 'TOML 格式错误'],
    
    // 通用兜底
    [/invalid/i, '格式错误'],
    [/incomplete/i, '不完整'],
  ]

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(message)) {
      return message.replace(pattern, replacement)
    }
  }
  
  return message
}

function tomlLinter() {
  return (view: import('@codemirror/view').EditorView): Diagnostic[] => {
    const text = view.state.doc.toString()
    if (!text.trim()) return []
    try {
      parseTOML(text)
      return []
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const translatedMsg = translateTomlError(msg)
      // 尝试解析行号
      const lineMatch = msg.match(/line (\d+)/i)
      const line = lineMatch ? parseInt(lineMatch[1]) - 1 : 0
      const lineInfo = view.state.doc.line(Math.min(line + 1, view.state.doc.lines))
      return [{
        from: lineInfo.from,
        to: lineInfo.to,
        severity: 'error',
        message: translatedMsg,
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
