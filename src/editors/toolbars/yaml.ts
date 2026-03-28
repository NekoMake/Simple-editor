import type { ToolbarAction } from '@/types/toolbar'

/**
 * YAML 格式快捷操作配置
 */
export const yamlActions: ToolbarAction[] = [
  {
    id: 'yaml-key-value',
    label: '键值对',
    icon: 'add_circle',
    subActions: [
      {
        id: 'yaml-string',
        label: '字符串',
        icon: 'format_quote',
        insertText: '\nkey: value',
      },
      {
        id: 'yaml-number',
        label: '数字',
        icon: 'numbers',
        insertText: '\nkey: 0',
      },
      {
        id: 'yaml-boolean-true',
        label: 'true',
        icon: 'check_circle',
        insertText: '\nkey: true',
      },
      {
        id: 'yaml-boolean-false',
        label: 'false',
        icon: 'cancel',
        insertText: '\nkey: false',
      },
      {
        id: 'yaml-null',
        label: 'null',
        icon: 'remove',
        insertText: '\nkey: null',
      },
      {
        id: 'yaml-multiline',
        label: '多行文本',
        icon: 'notes',
        insertText: '\nkey: |\n  ',
      },
      {
        id: 'yaml-inline',
        label: '折叠文本',
        icon: 'short_text',
        insertText: '\nkey: >-\n  ',
      },
    ],
  },
  {
    id: 'yaml-list',
    label: '列表',
    icon: 'format_list_bulleted',
    insertText: (selection) => {
      if (!selection) return '- '
      return selection.split('\n').map(line => `- ${line}`).join('\n')
    },
  },
  {
    id: 'yaml-comment',
    label: '注释',
    icon: 'tag',
    insertText: (selection) => {
      if (!selection) return '# '
      return selection.split('\n').map(line => `# ${line}`).join('\n')
    },
  },
  {
    id: 'yaml-anchor',
    label: '锚点',
    icon: 'anchor',
    insertText: '&anchor ',
  },
  {
    id: 'yaml-alias',
    label: '别名',
    icon: 'link',
    insertText: '*anchor',
  },
]
