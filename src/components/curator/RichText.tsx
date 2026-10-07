import katex from 'katex'
import 'katex/dist/katex.min.css'

type Chunk =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string; display: boolean }

const MATH =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g

function splitMath(input: string): Chunk[] {
  const chunks: Chunk[] = []
  let last = 0
  for (const match of input.matchAll(MATH)) {
    const index = match.index ?? 0
    if (index > last) chunks.push({ kind: 'text', value: input.slice(last, index) })
    const value = (match[1] ?? match[2] ?? match[3] ?? match[4] ?? '').trim()
    if (value) {
      chunks.push({
        kind: 'math',
        value,
        display: match[1] != null || match[2] != null,
      })
    }
    last = index + match[0].length
  }
  if (last < input.length) chunks.push({ kind: 'text', value: input.slice(last) })
  return chunks.length > 0 ? chunks : [{ kind: 'text', value: input }]
}

function MathSpan({ value, display }: { value: string; display: boolean }) {
  const html = katex.renderToString(value, {
    throwOnError: false,
    displayMode: display,
    output: 'html',
  })

  return (
    <span
      className={
        display
          ? 'my-3 block overflow-x-auto rounded-xl bg-gray-50 px-3 py-3 text-gray-900 [&_.katex]:tracking-normal'
          : 'inline [&_.katex]:tracking-normal'
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
  const blocks = paragraphs.length > 0 ? paragraphs : [text]

  return (
    <div className={className}>
      {blocks.map((paragraph, index) => (
        <p key={index} className={index > 0 ? 'mt-2' : undefined}>
          {splitMath(paragraph).map((chunk, chunkIndex) =>
            chunk.kind === 'text' ? (
              <span key={chunkIndex}>{chunk.value}</span>
            ) : (
              <MathSpan key={chunkIndex} value={chunk.value} display={chunk.display} />
            ),
          )}
        </p>
      ))}
    </div>
  )
}
