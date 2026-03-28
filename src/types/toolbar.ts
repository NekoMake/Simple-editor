import type { FileFormat } from './index'

/**
 * 编辑器上下文，传递给 handler
 */
export interface EditorContext {
  /** 获取当前内容 */
  getContent: () => string
  /** 设置内容 */
  setContent: (text: string) => void
  /** 文件格式 */
  format: FileFormat
  /** 显示提示消息 */
  showMessage: (message: string, isError?: boolean) => void
}

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
  handler?: (context?: EditorContext) => void | Promise<void>
  /** 子选项（用于键值对类型选择等） */
  subActions?: ToolbarAction[]
}

/**
 * 格式化插入文本的函数
 */
export type InsertTextFunction = (selection: string) => string
