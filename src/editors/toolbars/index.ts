import type { ToolbarAction } from '@/types/toolbar'
import type { FileFormat } from '@/types'
import { markdownActions } from './markdown'
import { jsonActions } from './json'
import { yamlActions } from './yaml'
import { tomlActions } from './toml'
import { txtActions } from './txt'

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

  return actionsMap[format] || []
}

export { markdownActions, jsonActions, yamlActions, tomlActions, txtActions }
