import { useSettingsStore } from '@/stores/settings'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

const FONTS_DIR = 'SimpleEditor/fonts'

export function useFontLoader() {
  const settingsStore = useSettingsStore()

  async function loadCustomFonts() {
    for (const font of settingsStore.customFonts) {
      await injectFont(font.name, font.fileName)
    }
  }

  async function injectFont(name: string, fileName: string) {
    try {
      const result = await Filesystem.readFile({
        path: `${FONTS_DIR}/${fileName}`,
        directory: Directory.Data,
      })
      // result.data 是 base64
      const fontFace = new FontFace(name, `url(data:font/truetype;base64,${result.data})`)
      const loaded = await fontFace.load()
      document.fonts.add(loaded)
    } catch {
      console.warn(`[FontLoader] 加载字体失败: ${name}`)
    }
  }

  async function installFont(name: string, base64Data: string, isMonospace: boolean): Promise<void> {
    const fileName = `${name.replace(/\s+/g, '_')}.ttf`

    // 确保目录存在
    try {
      await Filesystem.mkdir({ path: FONTS_DIR, directory: Directory.Data, recursive: true })
    } catch { /* 已存在 */ }

    // 保存字体文件
    await Filesystem.writeFile({
      path: `${FONTS_DIR}/${fileName}`,
      directory: Directory.Data,
      data: base64Data,
    })

    // 注入到文档
    await injectFont(name, fileName)

    // 写入设置
    settingsStore.addFont({ name, fileName, isMonospace })
  }

  async function uninstallFont(name: string) {
    const font = settingsStore.customFonts.find(f => f.name === name)
    if (!font) return
    try {
      await Filesystem.deleteFile({
        path: `${FONTS_DIR}/${font.fileName}`,
        directory: Directory.Data,
      })
    } catch { /* 忽略 */ }
    settingsStore.removeFont(name)
  }

  return { loadCustomFonts, installFont, uninstallFont }
}
