import type { ToolbarAction } from '@/types/toolbar'

/**
 * Markdown 格式快捷操作配置
 */
export const markdownActions: ToolbarAction[] = [
  {
    id: 'md-outline',
    label: '大纲',
    icon: 'menu_book',
  },
  {
    id: 'md-heading',
    label: '标题',
    icon: 'title',
    insertText: (selection) => selection ? `# ${selection}` : '# ',
  },
  {
    id: 'md-bold',
    label: '粗体',
    icon: 'format_bold',
    wrapText: { before: '**', after: '**' },
  },
  {
    id: 'md-italic',
    label: '斜体',
    icon: 'format_italic',
    wrapText: { before: '*', after: '*' },
  },
  {
    id: 'md-strikethrough',
    label: '删除线',
    icon: 'strikethrough_s',
    wrapText: { before: '~~', after: '~~' },
  },
  {
    id: 'md-code',
    label: '代码',
    icon: 'code',
    wrapText: { before: '`', after: '`' },
  },
  {
    id: 'md-codeblock',
    label: '代码块',
    icon: 'code_blocks',
    wrapText: { before: '\n```\n', after: '\n```\n' },
  },
  {
    id: 'md-link',
    label: '链接',
    icon: 'link',
    insertText: (selection) => `[${selection || '链接文本'}](url)`,
  },
  {
    id: 'md-image',
    label: '图片',
    icon: 'image',
    insertText: '![描述](url)',
  },
  {
    id: 'md-list',
    label: '列表',
    icon: 'format_list_bulleted',
    insertText: (selection) => {
      if (!selection) return '- '
      return selection.split('\n').map(line => `- ${line}`).join('\n')
    },
  },
  {
    id: 'md-ordered-list',
    label: '有序列表',
    icon: 'format_list_numbered',
    insertText: (selection) => {
      if (!selection) return '1. '
      return selection.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
    },
  },
  {
    id: 'md-quote',
    label: '引用',
    icon: 'format_quote',
    insertText: (selection) => {
      if (!selection) return '> '
      return selection.split('\n').map(line => `> ${line}`).join('\n')
    },
  },
  {
    id: 'md-table',
    label: '表格',
    icon: 'table',
    insertText: '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 数据 | 数据 | 数据 |\n',
  },
  {
    id: 'md-hr',
    label: '分隔线',
    icon: 'horizontal_rule',
    insertText: '\n---\n',
  },
  {
    id: 'md-task',
    label: '任务列表',
    icon: 'check_box',
    insertText: (selection) => {
      if (!selection) return '- [ ] '
      return selection.split('\n').map(line => `- [ ] ${line}`).join('\n')
    },
  },
]
