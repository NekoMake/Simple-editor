import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter, type Diagnostic } from '@codemirror/lint'
import {
  autocompletion,
  snippetCompletion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

type JsonPos = 'key' | 'value' | 'array' | 'root'

/**
 * 翻译 JSON 错误信息为中文
 * 基于真实 JSON.parse 错误消息的精确匹配
 */
function translateJsonError(message: string): string {
  const patterns: Array<[RegExp, string]> = [
    // 真实的 JSON.parse 错误消息（按优先级排序）
    [/^Bad control character in string literal in JSON at position \d+ \(line \d+ column \d+\)$/i, '字符串中有非法控制字符'],
    [/^Expected double-quoted property name in JSON at position \d+ \(line \d+ column \d+\)$/i, '期望双引号属性名'],
    [/^Expected ':' after property name in JSON at position \d+ \(line \d+ column \d+\)$/i, '属性名后需要 ":"'],
    [/^Expected ',' or '}' after property value in JSON at position \d+ \(line \d+ column \d+\)$/i, '属性值后需要 "," 或 "}"'],
    [/^Expected property name or '}' in JSON at position \d+ \(line \d+ column \d+\)$/i, '期望属性名或 "}"'],
    [/^Unexpected non-whitespace character after JSON at position \d+ \(line \d+ column \d+\)$/i, 'JSON 后有多余字符'],
    [/^Unexpected token '(.)', ".*" is not valid JSON$/i, '意外的字符 "$1"'],
    [/^Unexpected token '(\w+)', ".*" is not valid JSON$/i, '意外的标记 "$1"'],
    [/^Unexpected token ([^,]+), ".*" is not valid JSON$/i, '不是有效的 JSON'],
    [/^Unexpected end of JSON input$/i, 'JSON 意外结束'],
    [/^Unterminated string in JSON at position \d+$/i, '字符串未闭合'],
    
    // 通用兜底模式
    [/Bad control character/i, '非法控制字符'],
    [/Expected/i, '格式错误'],
    [/Unexpected/i, '意外的内容'],
  ]

  for (const [pattern, replacement] of patterns) {
    if (pattern.test(message)) {
      return message.replace(pattern, replacement)
    }
  }
  
  return message
}

/**
 * 汉化的 JSON linter
 */
function localizedJsonLinter() {
  const baseLinter = jsonParseLinter()
  return (view: EditorView): Diagnostic[] => {
    const diagnostics = baseLinter(view)
    // 翻译并简化错误信息
    return diagnostics.map(diag => {
      let message = translateJsonError(diag.message)
      // 移除详细的位置信息（已经通过行高亮显示）
      message = message.replace(/位置\s*\d+\s*\(.*?\)/g, '').trim()
      return {
        ...diag,
        message,
      }
    })
  }
}

/**
 * 通过 Lezer 语法树判断光标的 JSON 语义位置：
 *   key       —— 在 Object 内、尚未写 ":" 之前（即属性名位置）
 *   value     —— 在 ":" 之后（属性值位置）
 *   array     —— 在 Array 内（数组项位置）
 *   root      —— 文档根级
 */
function resolveJsonPos(ctx: CompletionContext): JsonPos {
  const tree = syntaxTree(ctx.state)
  let nd = tree.resolveInner(ctx.pos, -1)
  while (nd) {
    const name = nd.name
    // 跳过错误节点，继续向父节点查找
    if (name === '⚠') { nd = nd.parent!; continue }
    if (name === 'Property') {
      // Property 的第一个子节点是 key（String），之后是 value
      const keyNode = nd.firstChild
      return keyNode && ctx.pos <= keyNode.to ? 'key' : 'value'
    }
    if (name === 'Object')   return 'key'
    if (name === 'Array')    return 'array'
    if (name === 'JsonText') return 'root'
    if (!nd.parent) break
    nd = nd.parent
  }
  return 'root'
}

// ── 对象属性补全（光标在 {} 内 key 位置）────────────────────────
const PROP_COMPLETIONS = [
  snippetCompletion('"${key}": "${value}"',
    { label: '"key": "value"', type: 'property', detail: '字符串字段' }),
  snippetCompletion('"${key}": ${number}',
    { label: '"key": 0',       type: 'property', detail: '数字字段'   }),
  snippetCompletion('"${key}": true',
    { label: '"key": true',    type: 'property', detail: '布尔字段'   }),
  snippetCompletion('"${key}": null',
    { label: '"key": null',    type: 'property', detail: 'null 字段'  }),
  snippetCompletion('"${key}": [\n  ${items}\n]',
    { label: '"key": [...]',   type: 'property', detail: '数组字段'   }),
  snippetCompletion('"${key}": {\n  "${subkey}": "${subval}"\n}',
    { label: '"key": {...}',   type: 'property', detail: '嵌套对象'   }),
]

// ── 值补全（光标在 ":" 之后或 [] 内）────────────────────────────
const VALUE_COMPLETIONS = [
  { label: 'true',  type: 'keyword', detail: '布尔真' },
  { label: 'false', type: 'keyword', detail: '布尔假' },
  { label: 'null',  type: 'keyword', detail: 'null'  },
  snippetCompletion('"${value}"',
    { label: '"..."', type: 'text',  detail: '字符串值' }),
  snippetCompletion('[\n  ${item}\n]',
    { label: '[...]', type: 'class', detail: '数组'    }),
  snippetCompletion('{\n  "${key}": "${val}"\n}',
    { label: '{...}', type: 'class', detail: '对象'    }),
]

// ── 根级补全（空文档或顶层）──────────────────────────────────────
const ROOT_COMPLETIONS = [
  snippetCompletion('{\n  "${key}": "${value}"\n}',
    { label: '{...}', type: 'class', detail: 'JSON 对象' }),
  snippetCompletion('[\n  ${item}\n]',
    { label: '[...]', type: 'class', detail: 'JSON 数组' }),
  { label: 'true',  type: 'keyword', detail: '布尔真' },
  { label: 'false', type: 'keyword', detail: '布尔假' },
  { label: 'null',  type: 'keyword', detail: 'null'  },
]

function jsonCompletion(ctx: CompletionContext): CompletionResult | null {
  // 光标在字符串字面量内部时（用户正在手动输入 key/value），不弹出模板补全
  const node = syntaxTree(ctx.state).resolveInner(ctx.pos, -1)
  if (node.name === 'String') return null

  const word = ctx.matchBefore(/[\w"$]/)
  if (!word && !ctx.explicit) return null

  const from = word ? word.from : ctx.pos
  const pos  = resolveJsonPos(ctx)

  switch (pos) {
    case 'key':           return { from, options: PROP_COMPLETIONS  }
    case 'value':
    case 'array':         return { from, options: VALUE_COMPLETIONS }
    default:              return { from, options: ROOT_COMPLETIONS  }
  }
}

export function buildJsonExtensions(): Extension[] {
  return [
    json(),
    linter(localizedJsonLinter()),
    autocompletion({ override: [jsonCompletion] }),
  ]
}
