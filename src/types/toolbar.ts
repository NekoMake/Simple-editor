/**
 * 编辑器工具栏操作项
 */
export interface ToolbarAction {
  id: string
  label: string
  icon: string
  insertText?: string | ((selection: string) => string)
  wrapText?: { before: string; after: string }
  isActive?: () => boolean
  handler?: () => void
  /** 子选项（用于键值对类型选择等） */
  subActions?: ToolbarAction[]
}

/**
 * 格式化插入文本的函数
 */
export type InsertTextFunction = (selection: string) => string
