import type { ToolbarAction } from '@/types/toolbar'

/**
 * TOML 格式快捷操作配置
 */
export const tomlActions: ToolbarAction[] = [
  {
    id: 'toml-key-value',
    label: '键值对',
    icon: 'add_circle',
    subActions: [
      {
        id: 'toml-string',
        label: '字符串',
        icon: 'format_quote',
        insertText: '\nkey = "value"',
      },
      {
        id: 'toml-number',
        label: '数字',
        icon: 'numbers',
        insertText: '\nkey = 0',
      },
      {
        id: 'toml-boolean-true',
        label: 'true',
        icon: 'check_circle',
        insertText: '\nkey = true',
      },
      {
        id: 'toml-boolean-false',
        label: 'false',
        icon: 'cancel',
        insertText: '\nkey = false',
      },
      {
        id: 'toml-array',
        label: '数组',
        icon: 'data_array',
        insertText: '\nkey = [ ]',
      },
      {
        id: 'toml-date',
        label: '日期',
        icon: 'event',
        insertText: () => `\nkey = ${new Date().toISOString().split('T')[0]}`,
      },
      {
        id: 'toml-datetime',
        label: '日期时间',
        icon: 'schedule',
        insertText: () => `\nkey = ${new Date().toISOString()}`,
      },
    ],
  },
  {
    id: 'toml-section',
    label: '节',
    icon: 'folder',
    insertText: '[section]',
  },
  {
    id: 'toml-table',
    label: '表数组',
    icon: 'table_chart',
    insertText: '[[table]]',
  },
  {
    id: 'toml-comment',
    label: '注释',
    icon: 'tag',
    insertText: (selection) => {
      if (!selection) return '# '
      return selection.split('\n').map(line => `# ${line}`).join('\n')
    },
  },
]
