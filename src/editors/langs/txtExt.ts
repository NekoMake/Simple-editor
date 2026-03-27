import { autocompletion } from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'

/**
 * TXT 格式无语法补全，返回空的 autocompletion（必须有，保持接口一致）
 */
export function buildTxtExtensions(): Extension[] {
  return [
    // 空 autocompletion — 保持扩展接口统一，TXT 不提供补全
    autocompletion({ override: [] }),
  ]
}
