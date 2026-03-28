import type { FileFormat } from '@/types'

/**
 * Prettier 通用配置
 */
const prettierConfig = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5' as const,
  printWidth: 100,
  endOfLine: 'lf' as const,
}

/**
 * 懒加载 Prettier（按需加载，避免影响初始加载速度）
 */
let prettierPromise: Promise<typeof import('prettier')> | null = null
function loadPrettier() {
  if (!prettierPromise) {
    prettierPromise = import('prettier')
  }
  return prettierPromise
}

/**
 * 懒加载 Prettier TOML 插件
 */
let tomlPluginPromise: Promise<any> | null = null
function loadTomlPlugin() {
  if (!tomlPluginPromise) {
    tomlPluginPromise = import('prettier-plugin-toml')
  }
  return tomlPluginPromise
}

/**
 * 懒加载 Prettier Markdown 插件
 */
let markdownPluginPromise: Promise<any> | null = null
function loadMarkdownPlugin() {
  if (!markdownPluginPromise) {
    markdownPluginPromise = import('prettier/plugins/markdown')
  }
  return markdownPluginPromise
}

/**
 * 懒加载 Prettier Babel 插件（用于 JSON）
 */
let babelPluginPromise: Promise<any> | null = null
function loadBabelPlugin() {
  if (!babelPluginPromise) {
    babelPluginPromise = import('prettier/plugins/babel')
  }
  return babelPluginPromise
}

/**
 * 懒加载 Prettier Estree 插件（Babel 依赖）
 */
let estreePluginPromise: Promise<any> | null = null
function loadEstreePlugin() {
  if (!estreePluginPromise) {
    estreePluginPromise = import('prettier/plugins/estree')
  }
  return estreePluginPromise
}

/**
 * 懒加载 Prettier YAML 插件
 */
let yamlPluginPromise: Promise<any> | null = null
function loadYamlPlugin() {
  if (!yamlPluginPromise) {
    yamlPluginPromise = import('prettier/plugins/yaml')
  }
  return yamlPluginPromise
}

/**
 * 格式化文档内容
 */
export async function formatDocument(text: string, format: FileFormat): Promise<string> {
  try {
    switch (format) {
      case 'json': {
        const [prettier, babelPlugin, estreePlugin] = await Promise.all([
          loadPrettier(),
          loadBabelPlugin(),
          loadEstreePlugin(),
        ])
        return await prettier.format(text, {
          ...prettierConfig,
          parser: 'json',
          plugins: [estreePlugin, babelPlugin],
        })
      }

      case 'yaml':
      case 'yml': {
        const [prettier, yamlPlugin] = await Promise.all([
          loadPrettier(),
          loadYamlPlugin(),
        ])
        return await prettier.format(text, {
          ...prettierConfig,
          parser: 'yaml',
          plugins: [yamlPlugin],
        })
      }

      case 'toml': {
        const [prettier, tomlPlugin] = await Promise.all([
          loadPrettier(),
          loadTomlPlugin(),
        ])
        return await prettier.format(text, {
          ...prettierConfig,
          parser: 'toml',
          plugins: [tomlPlugin.default || tomlPlugin],
        })
      }

      case 'md': {
        const [prettier, markdownPlugin] = await Promise.all([
          loadPrettier(),
          loadMarkdownPlugin(),
        ])
        return await prettier.format(text, {
          ...prettierConfig,
          parser: 'markdown',
          proseWrap: 'preserve',
          plugins: [markdownPlugin],
        })
      }

      case 'txt':
        // 纯文本不需要格式化，只做简单清理
        return text.trim() + '\n'

      default:
        return text
    }
  } catch (error) {
    // 如果格式化失败，抛出错误让调用方处理
    throw error
  }
}
