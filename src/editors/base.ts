import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { lintKeymap } from '@codemirror/lint'
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'

/**
 * 构建 CodeMirror 基础扩展集合
 * 所有格式编辑器共用，不含语言特定扩展
 */
export function buildBaseExtensions(options: {
  fontSize: number
  fontFamily: string
  tabSize: number
  wordWrap: boolean
  showLineNumbers: boolean
  onChange: (value: string) => void
  isDark: boolean
}): Extension[] {
  const exts: Extension[] = [
    history(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    indentOnInput(),
    highlightActiveLine(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...closeBracketsKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        options.onChange(update.state.doc.toString())
      }
    }),
    EditorView.theme({
      '&': {
        fontSize: `${options.fontSize}px`,
        fontFamily: options.fontFamily,
        height: '100%',
        flex: 1,
      },
      '.cm-content': {
        padding: '16px',
        caretColor: 'var(--md-primary)',
        tabSize: String(options.tabSize),
      },
      '.cm-focused': { outline: 'none' },
      '.cm-line': { padding: '0 4px' },
      '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--md-primary)' },
      '.cm-selectionBackground': {
        background: 'color-mix(in srgb, var(--md-primary) 22%, transparent)',
      },
      '&.cm-focused .cm-selectionBackground': {
        background: 'color-mix(in srgb, var(--md-primary) 28%, transparent)',
      },
      '.cm-gutters': {
        background: 'var(--md-surface-container-low)',
        color: 'var(--md-on-surface-variant)',
        border: 'none',
        borderRight: '1px solid var(--md-outline-variant)',
        minWidth: '40px',
      },
      '.cm-activeLineGutter': {
        background: 'color-mix(in srgb, var(--md-primary) 12%, transparent)',
      },
      '.cm-activeLine': {
        background: 'color-mix(in srgb, var(--md-primary) 6%, transparent)',
      },
      '.cm-tooltip': {
        background: 'var(--md-surface-container-high)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: '8px',
        color: 'var(--md-on-surface)',
        boxShadow: '0 4px 8px 3px rgba(0,0,0,.15)',
      },
      '.cm-tooltip-autocomplete': {
        '& > ul > li': { padding: '6px 12px' },
        '& > ul > li[aria-selected]': {
          background: 'var(--md-secondary-container)',
          color: 'var(--md-on-secondary-container)',
        },
      },
    }),
  ]

  if (options.showLineNumbers) {
    exts.push(lineNumbers())
  }

  if (options.wordWrap) {
    exts.push(EditorView.lineWrapping)
  }

  return exts
}

/**
 * 创建 CodeMirror 实例
 */
export function createEditorView(container: HTMLElement, extensions: Extension[]): EditorView {
  const state = EditorState.create({ extensions })
  return new EditorView({ state, parent: container })
}
