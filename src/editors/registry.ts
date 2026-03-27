import type { EditorModuleDefinition } from '@/types'

/**
 * 编辑器模块注册表
 * 每种格式对应一个模块定义，方便后续扩展
 */
export const MODULE_REGISTRY: EditorModuleDefinition[] = [
  {
    id: 'txt',
    displayName: '纯文本',
    icon: 'article',
    color: '--md-primary-container',
    extensions: ['txt'],
    hasSpecialPreview: true,   // 小说阅读器模式
    supportsCompletion: false,
    supportsSyntaxCheck: false,
  },
  {
    id: 'md',
    displayName: 'Markdown',
    icon: 'format_quote',
    color: '--md-tertiary-container',
    extensions: ['md', 'markdown'],
    hasSpecialPreview: true,   // Markdown 渲染
    supportsCompletion: true,
    supportsSyntaxCheck: false,
  },
  {
    id: 'json',
    displayName: 'JSON',
    icon: 'data_object',
    color: '--md-secondary-container',
    extensions: ['json'],
    hasSpecialPreview: false,
    supportsCompletion: true,
    supportsSyntaxCheck: true,
  },
  {
    id: 'toml',
    displayName: 'TOML',
    icon: 'settings',
    color: '--md-error-container',
    extensions: ['toml'],
    hasSpecialPreview: false,
    supportsCompletion: true,
    supportsSyntaxCheck: true,
  },
  {
    id: 'yaml',
    displayName: 'YAML',
    icon: 'code',
    color: '--md-surface-container-highest',
    extensions: ['yaml', 'yml'],
    hasSpecialPreview: false,
    supportsCompletion: true,
    supportsSyntaxCheck: true,
  },
]

export function getModuleById(id: string): EditorModuleDefinition | undefined {
  return MODULE_REGISTRY.find(m => m.id === id)
}

export function getModuleByExt(ext: string): EditorModuleDefinition | undefined {
  return MODULE_REGISTRY.find(m => m.extensions.includes(ext.toLowerCase()))
}
