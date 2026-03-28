import type { ToolbarAction } from '@/types/toolbar'

/**
 * JSON 格式快捷操作配置
 */
export const jsonActions: ToolbarAction[] = [
  {
    id: 'json-key-value',
    label: '键值对',
    icon: 'add_circle',
    subActions: [
      {
        id: 'json-string',
        label: '字符串',
        icon: 'format_quote',
        insertText: '\n"key": "value"',
      },
      {
        id: 'json-number',
        label: '数字',
        icon: 'numbers',
        insertText: '\n"key": 0',
      },
      {
        id: 'json-boolean-true',
        label: 'true',
        icon: 'check_circle',
        insertText: '\n"key": true',
      },
      {
        id: 'json-boolean-false',
        label: 'false',
        icon: 'cancel',
        insertText: '\n"key": false',
      },
      {
        id: 'json-null',
        label: 'null',
        icon: 'remove',
        insertText: '\n"key": null',
      },
      {
        id: 'json-object',
        label: '对象',
        icon: 'data_object',
        insertText: '\n"key": {\n  \n}',
      },
      {
        id: 'json-array',
        label: '数组',
        icon: 'data_array',
        insertText: '\n"key": [\n  \n]',
      },
    ],
  },
  {
    id: 'json-array-empty',
    label: '数组',
    icon: 'data_array',
    insertText: '[\n  \n]',
  },
  {
    id: 'json-object-empty',
    label: '对象',
    icon: 'data_object',
    insertText: '{\n  \n}',
  },
  {
    id: 'json-format',
    label: '格式化',
    icon: 'auto_fix_high',
    handler: () => {
      // 这个将在集成时实现
    },
  },
]
