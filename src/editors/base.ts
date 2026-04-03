import { EditorState, type Extension, StateField, StateEffect, Transaction } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, Decoration, type DecorationSet, WidgetType } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { lintKeymap, diagnosticCount, forEachDiagnostic } from '@codemirror/lint'
import { indentOnInput, syntaxHighlighting, HighlightStyle, bracketMatching } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

/**
 * IME 组合输入状态管理
 * 用于在输入法组合输入（如中文拼音选字）期间禁用某些扩展，防止干扰输入
 */
const setComposing = StateEffect.define<boolean>()

const composingState = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setComposing)) return effect.value
    }
    return value
  },
})

const dynamicThemeHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--md-primary)', fontWeight: 'bold' },
  { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: 'var(--md-tertiary)' },
  { tag: [t.variableName], color: 'var(--md-on-surface)' },
  { tag: [t.string, t.inserted, t.special(t.string)], color: 'var(--md-secondary)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--md-error)' },
  { tag: [t.comment, t.meta], color: 'var(--md-outline)', fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.link, color: 'var(--md-primary)', textDecoration: 'underline' },
  { tag: t.heading, fontWeight: 'bold', color: 'var(--md-primary)' },
  { tag: t.punctuation, color: 'var(--md-on-surface-variant)' },
])

/**
 * 行尾诊断信息显示扩展（类似 Error Lens）
 * 将 lint 错误信息直接显示在代码行的末尾
 */
function inlineDiagnostics(): Extension {
  // 创建诊断信息小部件
  class DiagnosticWidget extends WidgetType {
    constructor(readonly message: string, readonly severity: string) {
      super()
    }

    toDOM() {
      const span = document.createElement('span')
      span.className = `cm-inline-diagnostic cm-inline-diagnostic-${this.severity}`
      
      // 移动端使用更短的消息（30字符），桌面端稍长（50字符）
      const isMobile = window.innerWidth < 768
      const maxLength = isMobile ? 30 : 50
      const shortMessage = this.message.length > maxLength 
        ? this.message.substring(0, maxLength - 3) + '...' 
        : this.message
      
      // 移动端只显示图标+简短消息，去掉多余信息
      const displayMessage = isMobile 
        ? `⚠ ${shortMessage.split('(')[0].trim()}` // 移除括号内的详细位置信息
        : `⚠ ${shortMessage}`
      
      span.textContent = ` ${displayMessage}`
      span.title = this.message // 完整消息作为 tooltip
      return span
    }

    eq(other: DiagnosticWidget): boolean {
      return other.message === this.message && other.severity === this.severity
    }

    ignoreEvent(): boolean {
      return true
    }
  }

  const inlineDiagnosticField = StateField.define<DecorationSet>({
    create(state) {
      return buildDiagnosticDecorations(state)
    },
    
    update(decorations, tr) {
      // 强制每次都重新构建，确保 lint 状态变化时能刷新
      // tr.state 包含了最新的 lint 状态
      return buildDiagnosticDecorations(tr.state)
    },
    
    provide: f => EditorView.decorations.from(f),
  })

  // 构建诊断装饰器
  function buildDiagnosticDecorations(state: EditorState): DecorationSet {
    const diagnostics: Array<{ from: number; to: number; message: string; severity: string }> = []
    
    // 收集所有诊断信息
    forEachDiagnostic(state, (diagnostic, from, to) => {
      diagnostics.push({
        from,
        to,
        message: diagnostic.message,
        severity: diagnostic.severity,
      })
    })
    
    // 按行分组诊断信息（每行只显示第一个错误）
    const lineMap = new Map<number, { message: string; severity: string }>()
    diagnostics.forEach(({ from, message, severity }) => {
      const line = state.doc.lineAt(from).number
      if (!lineMap.has(line)) {
        // 只保留每行的第一个错误
        lineMap.set(line, { message, severity })
      }
    })

    // 创建装饰器
    const decorationArray: Array<any> = []
    lineMap.forEach((diag, lineNumber) => {
      const line = state.doc.line(lineNumber)
      const lineEnd = line.to
      
      // 在行尾添加 widget
      const widget = Decoration.widget({
        widget: new DiagnosticWidget(diag.message, diag.severity),
        side: 1,
      })
      
      decorationArray.push(widget.range(lineEnd))
    })

    return Decoration.set(decorationArray, true)
  }

  return [
    inlineDiagnosticField,
    EditorView.theme({
      '.cm-inline-diagnostic': {
        display: 'inline',
        whiteSpace: 'nowrap',
        marginLeft: '0.5em',
        fontSize: '0.75em',
        opacity: '0.7',
        fontStyle: 'italic',
        pointerEvents: 'none',
        userSelect: 'none',
        maxWidth: '40vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '.cm-inline-diagnostic-error': {
        color: 'var(--md-error)',
      },
      '.cm-inline-diagnostic-warning': {
        color: '#ff9800',
      },
      '.cm-inline-diagnostic-info': {
        color: 'var(--md-primary)',
      },
      // 移动端特殊样式
      '@media (max-width: 768px)': {
        '.cm-inline-diagnostic': {
          fontSize: '0.7em',
          marginLeft: '0.3em',
          maxWidth: '30vw',
        },
      },
    }),
  ]
}

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
  // IME 组合输入事件处理器
  const compositionHandler = EditorView.domEventHandlers({
    compositionstart(event, view) {
      view.dispatch({ effects: setComposing.of(true) })
      return false
    },
    compositionend(event, view) {
      view.dispatch({ effects: setComposing.of(false) })
      return false
    },
  })

  // 在 composition 期间过滤可能干扰输入的事务
  const compositionProtection = EditorState.transactionFilter.of((tr) => {
    // 如果当前处于 composition 状态，且事务包含文档修改
    if (tr.state.field(composingState, false) && tr.docChanged) {
      // 只允许用户输入类型的修改，过滤掉其他类型的修改（如自动补全、自动缩进等）
      // 用户输入会有 userEvent 注解
      const userEvent = tr.annotation(Transaction.userEvent)
      // 允许 input（用户输入）、delete（用户删除）
      if (userEvent && (userEvent.startsWith('input') || userEvent.startsWith('delete'))) {
        return tr
      }
      // 如果没有 userEvent 注解，或者是其他类型的事件，则过滤掉
      // 但保留不修改文档的事务（如选择变化、状态更新等）
      return []
    }
    return tr
  })

  const exts: Extension[] = [
    // IME 组合输入状态追踪
    composingState,
    compositionHandler,
    compositionProtection,
    history(),
    syntaxHighlighting(dynamicThemeHighlightStyle, { fallback: true }),
    bracketMatching(),
    // 在 composition 期间禁用括号自动补全，避免干扰输入法选字
    closeBrackets(),
    indentOnInput(),
    highlightActiveLine(),
    // 行尾诊断信息显示
    inlineDiagnostics(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...closeBracketsKeymap,
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
        fontFamily: 'var(--app-font-sans)',
        height: '100%',
        flex: 1,
        background: 'var(--md-surface)',
        color: 'var(--md-on-surface)',
      },
      '.cm-content': {
        fontFamily: options.fontFamily,
        padding: '20px 16px',
        caretColor: 'var(--md-primary)',
        tabSize: String(options.tabSize),
        lineHeight: '1.65',
        minHeight: '100%',
      },
      '.cm-focused': { outline: 'none' },
      '.cm-line': { 
        padding: '0 6px',
        lineHeight: '1.65',
      },
      '&.cm-focused .cm-cursor': { 
        borderLeftColor: 'var(--md-primary)',
        borderLeftWidth: '2px',
      },
      '.cm-selectionBackground': {
        background: 'color-mix(in srgb, var(--md-primary) 16%, transparent)',
      },
      '&.cm-focused .cm-selectionBackground': {
        background: 'color-mix(in srgb, var(--md-primary) 24%, transparent)',
      },
      '.cm-gutters': {
        background: 'var(--md-surface-container)',
        color: 'var(--md-on-surface-variant)',
        border: 'none',
        borderRight: '1px solid var(--md-outline-variant)',
        minWidth: '48px',
        fontSize: '14px',
        paddingRight: '8px',
      },
      '.cm-gutterElement': {
        paddingLeft: '8px',
      },
      '.cm-activeLineGutter': {
        background: 'var(--md-surface-container-high)',
        color: 'var(--md-primary)',
        fontWeight: '600',
      },
      '.cm-activeLine': {
        background: 'color-mix(in srgb, var(--md-primary) 8%, transparent)',
      },
      '.cm-tooltip': {
        background: 'var(--md-surface-container-highest)',
        border: '1px solid var(--md-outline)',
        borderRadius: 'var(--md-shape-md)',
        color: 'var(--md-on-surface)',
        boxShadow: 'var(--md-elevation-2)',
        fontSize: `${Math.max(options.fontSize - 2, 14)}px`,
        overflow: 'hidden',
        fontFamily: 'var(--app-font-sans)',
      },
      '.cm-foldGutter': {
        minWidth: '20px',
      },
      '.cm-foldPlaceholder': {
        background: 'var(--md-surface-container-high)',
        border: '1px solid var(--md-outline-variant)',
        borderRadius: 'var(--md-shape-xs)',
        color: 'var(--md-on-surface-variant)',
        padding: '0 8px',
        margin: '0 2px',
      },
      '.cm-searchMatch': {
        background: 'color-mix(in srgb, var(--md-tertiary) 20%, transparent)',
        outline: '1px solid var(--md-tertiary)',
      },
      '.cm-searchMatch-selected': {
        background: 'color-mix(in srgb, var(--md-tertiary) 35%, transparent)',
      },
    }),
    EditorView.contentAttributes.of({
      'autocapitalize': 'off',
      'autocorrect': 'off',
      'spellcheck': 'false',
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
