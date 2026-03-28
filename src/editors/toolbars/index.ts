import type { ToolbarAction } from '@/types/toolbar'
import type { FileFormat } from '@/types'
import { markdownActions } from './markdown'
import { jsonActions } from './json'
import { yamlActions } from './yaml'
import { tomlActions } from './toml'
import { txtActions } from './txt'
import { formatDocument } from '@/utils/formatter'

const commonActions: ToolbarAction[] = [
  {
    id: 'format-all',
    label: '格式化',
    icon: 'auto_fix_high',
    handler: async (context) => {
      if (!context) return
      try {
        const formatted = await formatDocument(context.getContent(), context.format)
        context.setContent(formatted)
        context.showMessage('格式化成功')
      } catch (error) {
        context.showMessage(
          '格式化失败：' + (error instanceof Error ? error.message : '未知错误'),
          true
        )
      }
    },
  },
  {
    id: 'indent',
    label: '缩进',
    icon: 'format_indent_increase',
    insertText: (selection) => {
      if (!selection) return '  '
      return selection.split('\n').map(line => '  ' + line).join('\n')
    },
  },
  {
    id: 'outdent',
    label: '取消缩进',
    icon: 'format_indent_decrease',
    insertText: (selection) => {
      if (!selection) return ''
      return selection.split('\n').map(line => line.replace(/^  /, '')).join('\n')
    },
  },
]

/**
 * 获取指定格式的工具栏操作配置
 */
export function getToolbarActions(format: FileFormat): ToolbarAction[] {
  const actionsMap: Record<FileFormat, ToolbarAction[]> = {
    md: markdownActions,
    json: jsonActions,
    yaml: yamlActions,
    yml: yamlActions,
    toml: tomlActions,
    txt: txtActions,
  }

  const formatActions = actionsMap[format] || []
  return [...commonActions, ...formatActions]
}

export { markdownActions, jsonActions, yamlActions, tomlActions, txtActions }
