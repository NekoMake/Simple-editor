import { EditorState } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'

export interface MarkdownHeading {
  level: number
  text: string
  line: number
  ch: number // column
  pos: number // absolute position
}

/**
 * Parses the CodeMirror syntax tree to extract all markdown headings.
 */
export function getMarkdownHeadings(state: EditorState): MarkdownHeading[] {
  const headings: MarkdownHeading[] = []
  const tree = syntaxTree(state)

  tree.iterate({
    enter: (node) => {
      const match = node.name.match(/^ATXHeading(\d)$/i) || node.name.match(/^Heading(\d)$/i)
      if (match) {
        const level = parseInt(match[1], 10)
        let text = state.sliceDoc(node.from, node.to)
        
        // Remove preceding '#' and spaces
        text = text.replace(/^#+\s*/, '')

        const lineInfo = state.doc.lineAt(node.from)

        headings.push({
          level,
          text,
          line: lineInfo.number,
          ch: node.from - lineInfo.from,
          pos: node.from
        })
      }
    }
  })

  return headings
}
