import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import type { AppFile, FileFormat, HomeFilterState } from '@/types'
import { generateId, getFileFormat, formatFileSize } from '@/utils/helpers'

const APP_DIR = 'SimpleEditor'
const META_FILE = 'meta.json'

export const useFileStore = defineStore('files', () => {
  const files = ref<AppFile[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ---- 筛选状态 ----
  const filter = ref<HomeFilterState>({
    query: '',
    format: 'all',
    sortBy: 'modifiedAt',
    sortOrder: 'desc',
  })

  const filteredFiles = computed(() => {
    let result = [...files.value]

    if (filter.value.format !== 'all') {
      result = result.filter(f => f.format === filter.value.format)
    }

    if (filter.value.query.trim()) {
      const q = filter.value.query.toLowerCase()
      result = result.filter(f => f.name.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      const key = filter.value.sortBy
      const aVal = a[key] as number | string
      const bVal = b[key] as number | string
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return filter.value.sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  })

  // ---- 初始化 ----
  async function init() {
    isLoading.value = true
    try {
      await ensureAppDir()
      await loadMeta()
    } catch (e) {
      error.value = String(e)
    } finally {
      isLoading.value = false
    }
  }

  async function ensureAppDir() {
    try {
      await Filesystem.mkdir({
        path: APP_DIR,
        directory: Directory.Data,
        recursive: true,
      })
    } catch {
      // 目录已存在，忽略
    }
  }

  async function loadMeta() {
    try {
      const result = await Filesystem.readFile({
        path: `${APP_DIR}/${META_FILE}`,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      })
      files.value = JSON.parse(result.data as string)
    } catch {
      files.value = []
    }
  }

  async function saveMeta() {
    await Filesystem.writeFile({
      path: `${APP_DIR}/${META_FILE}`,
      directory: Directory.Data,
      data: JSON.stringify(files.value),
      encoding: Encoding.UTF8,
      recursive: true,
    })
  }

  // ---- 读写文件内容 ----
  async function readContent(file: AppFile): Promise<string> {
    const result = await Filesystem.readFile({
      path: `${APP_DIR}/${file.path}`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    })
    return result.data as string
  }

  async function writeContent(file: AppFile, content: string): Promise<void> {
    await Filesystem.writeFile({
      path: `${APP_DIR}/${file.path}`,
      directory: Directory.Data,
      data: content,
      encoding: Encoding.UTF8,
      recursive: true,
    })
    // 更新元数据
    const idx = files.value.findIndex(f => f.id === file.id)
    if (idx !== -1) {
      files.value[idx].modifiedAt = Date.now()
      files.value[idx].size = new Blob([content]).size
      // 缓存首行作为标题
      files.value[idx].titleCache = content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60)
    }
    await saveMeta()
  }

  // ---- 创建新文件 ----
  async function createFile(name: string, format: FileFormat, initialContent = ''): Promise<AppFile> {
    const id = generateId()
    const fileName = name.endsWith(`.${format}`) ? name : `${name}.${format}`
    const path = `${id}.${format}`
    const now = Date.now()

    const appFile: AppFile = {
      id,
      name: fileName,
      format,
      path,
      size: new Blob([initialContent]).size,
      createdAt: now,
      modifiedAt: now,
      titleCache: initialContent.split('\n')[0].slice(0, 60),
    }

    await Filesystem.writeFile({
      path: `${APP_DIR}/${path}`,
      directory: Directory.Data,
      data: initialContent,
      encoding: Encoding.UTF8,
      recursive: true,
    })

    files.value.unshift(appFile)
    await saveMeta()
    return appFile
  }

  // ---- 导入外部文件（拷贝到内部） ----
  async function importFile(sourcePath: string, fileName: string): Promise<AppFile> {
    const format = getFileFormat(fileName)
    const id = generateId()
    const destPath = `${id}.${format}`
    const now = Date.now()

    // 读取源文件
    const result = await Filesystem.readFile({
      path: sourcePath,
      encoding: Encoding.UTF8,
    })
    const content = result.data as string

    // 写入内部存储
    await Filesystem.writeFile({
      path: `${APP_DIR}/${destPath}`,
      directory: Directory.Data,
      data: content,
      encoding: Encoding.UTF8,
      recursive: true,
    })

    const appFile: AppFile = {
      id,
      name: fileName,
      format,
      path: destPath,
      size: new Blob([content]).size,
      createdAt: now,
      modifiedAt: now,
      titleCache: content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 60),
    }

    files.value.unshift(appFile)
    await saveMeta()
    return appFile
  }

  // ---- 导出文件 ----
  async function exportFile(file: AppFile): Promise<void> {
    const content = await readContent(file)
    // 写入 Documents 目录
    await Filesystem.writeFile({
      path: file.name,
      directory: Directory.Documents,
      data: content,
      encoding: Encoding.UTF8,
      recursive: true,
    })
  }

  // ---- 删除文件 ----
  async function deleteFile(fileId: string): Promise<void> {
    const file = files.value.find(f => f.id === fileId)
    if (!file) return

    try {
      await Filesystem.deleteFile({
        path: `${APP_DIR}/${file.path}`,
        directory: Directory.Data,
      })
    } catch { /* 文件不存在也跳过 */ }

    files.value = files.value.filter(f => f.id !== fileId)
    await saveMeta()
  }

  // ---- 重命名 ----
  async function renameFile(fileId: string, newName: string): Promise<void> {
    const idx = files.value.findIndex(f => f.id === fileId)
    if (idx === -1) return
    const file = files.value[idx]
    const ext = file.format
    const fileName = newName.endsWith(`.${ext}`) ? newName : `${newName}.${ext}`
    files.value[idx].name = fileName
    files.value[idx].modifiedAt = Date.now()
    await saveMeta()
  }

  function getFileById(id: string): AppFile | undefined {
    return files.value.find(f => f.id === id)
  }

  function formatSize(size: number) {
    return formatFileSize(size)
  }

  return {
    files,
    isLoading,
    error,
    filter,
    filteredFiles,
    init,
    readContent,
    writeContent,
    createFile,
    importFile,
    exportFile,
    deleteFile,
    renameFile,
    getFileById,
    formatSize,
  }
})
