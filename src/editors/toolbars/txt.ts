import type { ToolbarAction } from '@/types/toolbar'

/**
 * 纯文本格式快捷操作配置
 */
export const txtActions: ToolbarAction[] = [
  {
    id: 'txt-timestamp',
    label: '时间戳',
    icon: 'schedule',
    insertText: () => new Date().toLocaleString('zh-CN'),
  },
  {
    id: 'txt-date',
    label: '日期',
    icon: 'event',
    insertText: () => new Date().toLocaleDateString('zh-CN'),
  },
  {
    id: 'txt-time',
    label: '时间',
    icon: 'access_time',
    insertText: () => new Date().toLocaleTimeString('zh-CN'),
  },
  {
    id: 'txt-separator',
    label: '分隔符',
    icon: 'horizontal_rule',
    insertText: '\n' + '='.repeat(50) + '\n',
  },
]
