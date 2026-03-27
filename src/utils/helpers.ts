import type { FileFormat } from '@/types'

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function getFileFormat(fileName: string): FileFormat {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const supported: FileFormat[] = ['txt', 'md', 'json', 'toml', 'yaml']
  return supported.includes(ext as FileFormat) ? (ext as FileFormat) : 'txt'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 86400 * 2) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

/** 判断是否为平板（宽度 >= 600dp） */
export function isTablet(): boolean {
  return window.innerWidth >= 600
}
