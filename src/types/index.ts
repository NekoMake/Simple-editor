// ============================================================
// 核心类型定义
// ============================================================

export type FileFormat = 'txt' | 'md' | 'json' | 'toml' | 'yaml'

export interface AppFile {
  id: string
  name: string
  format: FileFormat
  path: string          // 内部存储相对路径
  size: number          // 字节
  createdAt: number     // timestamp
  modifiedAt: number    // timestamp
  titleCache?: string   // 文件首行/标题缓存
}

export interface DiagnosticItem {
  from: number
  to: number
  severity: 'error' | 'warning' | 'info'
  message: string
}

// 阅读设置（用于TXT小说阅读器）
export interface ReadingSettings {
  fontSize: number          // px, 12-36
  lineHeight: number        // 1.2 - 2.5
  fontFamily: string        // 字体名称
  backgroundColor: string   // 背景色
  textColor: string         // 文字颜色
  pageMargin: number        // 水平内边距, px
  paragraphSpacing: number  // 段落间距 em
  preset: 'white' | 'sepia' | 'gray' | 'dark' | 'custom'
}

// 编辑器设置
export interface EditorSettings {
  fontSize: number      // px, 12-24
  tabSize: number       // 2 | 4
  wordWrap: boolean
  lineNumbers: boolean
  fontFamily: string    // 代码字体
}

// 主题设置
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system'
  colorScheme: ThemeColorScheme
  customPrimaryHex: string  // 用户自定义颜色
}

export type ThemeColorScheme =
  | 'teal'
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'rose'
  | 'custom'

// 自定义字体
export interface CustomFont {
  name: string         // 字体名称（用于 font-family）
  fileName: string     // 内部存储的文件名
  isMonospace: boolean // 是否是等宽字体
}

// 完整应用设置
export interface AppSettings {
  theme: ThemeSettings
  reading: ReadingSettings
  editor: EditorSettings
  customFonts: CustomFont[]
}

// 编辑器模块定义（注册表接口）
export interface EditorModuleDefinition {
  id: string
  displayName: string
  icon: string
  color: string            // M3 容器色（CSS变量名）
  onColor: string          // M3 容器前景色（CSS变量名）
  extensions: string[]     // 文件扩展名（不含点）
  hasSpecialPreview: boolean
  supportsCompletion: boolean
  supportsSyntaxCheck: boolean
}

// 路由参数
export interface EditorRouteParams {
  fileId: string
  mode?: 'edit' | 'preview'
}

// 文件操作结果
export interface FileOperationResult {
  success: boolean
  error?: string
  data?: unknown
}

// 搜索/筛选状态
export interface HomeFilterState {
  query: string
  format: FileFormat | 'all'
  sortBy: 'name' | 'modifiedAt' | 'createdAt' | 'size'
  sortOrder: 'asc' | 'desc'
}
