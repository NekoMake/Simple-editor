import type { Extension } from '@codemirror/state'
import type { FileFormat } from '@/types'
import { buildJsonExtensions } from './langs/jsonExt'
import { buildMarkdownExtensions } from './langs/markdownExt'
import { buildTomlExtensions } from './langs/tomlExt'
import { buildYamlExtensions } from './langs/yamlExt'
import { buildTxtExtensions } from './langs/txtExt'

/**
 * 根据文件格式获取语言特定的 CodeMirror 扩展
 */
export function getLanguageExtensions(format: FileFormat): Extension[] {
  switch (format) {
    case 'json':  return buildJsonExtensions()
    case 'md':    return buildMarkdownExtensions()
    case 'toml':  return buildTomlExtensions()
    case 'yaml':  return buildYamlExtensions()
    case 'txt':   return buildTxtExtensions()
    default:      return buildTxtExtensions()
  }
}
