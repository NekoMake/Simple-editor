import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter } from '@codemirror/lint'
import { autocompletion, type CompletionContext } from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'

function jsonCompletion(context: CompletionContext) {
  const word = context.matchBefore(/[\w"$#@]/)
  if (!word && !context.explicit) return null

  return {
    from: word ? word.from : context.pos,
    options: [
      { label: '"key": "value"', type: 'text', detail: '字符串字段' },
      { label: '"key": 0', type: 'text', detail: '数字字段' },
      { label: '"key": true', type: 'text', detail: '布尔字段' },
      { label: '"key": null', type: 'text', detail: 'null 字段' },
      { label: '"key": []', type: 'text', detail: '数组字段' },
      { label: '"key": {}', type: 'text', detail: '对象字段' },
    ],
  }
}

export function buildJsonExtensions(): Extension[] {
  return [
    json(),
    linter(jsonParseLinter()),
    autocompletion({ override: [jsonCompletion] }),
  ]
}
