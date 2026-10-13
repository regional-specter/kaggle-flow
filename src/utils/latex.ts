const LATEX_COMMANDS = new Set([
  'bar',
  'because',
  'begin',
  'beta',
  'bf',
  'big',
  'bigg',
  'biggl',
  'biggr',
  'bigl',
  'bigr',
  'binom',
  'bmatrix',
  'bmod',
  'boldsymbol',
  'bot',
  'bullet',
  'flat',
  'forall',
  'frac',
  'nabla',
  'nearrow',
  'neq',
  'newline',
  'ngtr',
  'ni',
  'nLeftarrow',
  'nleftarrow',
  'nless',
  'nmid',
  'not',
  'notin',
  'nparallel',
  'nRightarrow',
  'nrightarrow',
  'nsim',
  'nsubseteq',
  'nsupseteq',
  'nu',
  'nvdash',
  'nwarrow',
  'rangle',
  'rbrace',
  'rceil',
  'rfloor',
  'rho',
  'right',
  'rightarrow',
  'rvert',
  'tag',
  'tan',
  'tanh',
  'tau',
  'text',
  'textbf',
  'textit',
  'textrm',
  'textsf',
  'textstyle',
  'texttt',
  'tfrac',
  'theta',
  'tilde',
  'times',
  'to',
  'top',
  'triangle',
])

const CONTROL_LETTER: Record<string, string> = {
  '\b': 'b',
  '\f': 'f',
  '\n': 'n',
  '\r': 'r',
  '\t': 't',
}

function restoreCommand(control: string, word: string): string | null {
  const letter = CONTROL_LETTER[control]
  if (!letter || !word) return null
  const command = letter + word
  if (!LATEX_COMMANDS.has(command)) return null
  return `\\${command}`
}

function restoreControlRun(text: string, controls: RegExp, commands: Set<string>): string {
  return text.replace(controls, (match, word: string) => {
    const restored = restoreCommand(match[0], word)
    if (!restored) return match
    const command = restored.slice(1)
    return commands.has(command) ? restored : match
  })
}

export function repairControlChars(text: string): string {
  const newlineCommands = new Set(
    [...LATEX_COMMANDS].filter((command) => command.startsWith('n') && command.length > 2),
  )
  const withoutControls = restoreControlRun(text, /[\b\f\r\t]([a-zA-Z]+)/g, LATEX_COMMANDS)
  const withoutLongNewlines = restoreControlRun(withoutControls, /\n([a-zA-Z]+)/g, newlineCommands)
  return withoutLongNewlines.replace(/\$\$[\s\S]+?\$\$/g, (block) =>
    restoreControlRun(block, /\n([a-zA-Z]+)/g, LATEX_COMMANDS),
  )
}

export function repairJsonLatex(raw: string): string {
  let out = ''
  let inString = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (!inString) {
      out += ch
      if (ch === '"') inString = true
      continue
    }

    if (ch === '"') {
      out += ch
      inString = false
      continue
    }

    if (ch !== '\\') {
      out += ch
      continue
    }

    const next = raw[i + 1]
    if (next == null) {
      out += '\\\\'
      continue
    }

    if (next === '\\' || next === '"') {
      out += `\\${next}`
      i += 1
      continue
    }

    if (next === 'u' && /^u[0-9a-fA-F]{4}/.test(raw.slice(i + 1, i + 6))) {
      out += raw.slice(i, i + 6)
      i += 5
      continue
    }

    if (next === '/') {
      out += '\\/'
      i += 1
      continue
    }

    if ('bfnrt'.includes(next)) {
      const letters = /^[a-zA-Z]+/.exec(raw.slice(i + 2))?.[0] ?? ''
      if (restoreCommand(next === 'b' ? '\b' : next === 'f' ? '\f' : next === 'n' ? '\n' : next === 'r' ? '\r' : '\t', letters)) {
        out += `\\\\${next}`
        i += 1
        continue
      }
      out += `\\${next}`
      i += 1
      continue
    }

    out += `\\\\${next}`
    i += 1
  }

  return out
}

export function prepareMathSource(value: string): string {
  let src = repairControlChars(value)
    .replace(/\\begin\{equation\*?\}/g, '')
    .replace(/\\end\{equation\*?\}/g, '')
    .replace(/\\begin\{align\*?\}/g, '')
    .replace(/\\end\{align\*?\}/g, '')
    .replace(/\\\\([a-zA-Z]+)/g, '\\$1')
    .replace(/(^|[^A-Za-z\\])frac(?=\s*\{)/g, '$1\\frac')

  const left = src.match(/\\left(?![a-zA-Z])/g)?.length ?? 0
  const right = src.match(/\\right(?![a-zA-Z])/g)?.length ?? 0
  if (left > right) {
    src = src.replace(/(^|[^A-Za-z\\])ight(?![A-Za-z])/g, '$1\\right')
  }

  const rightAfter = src.match(/\\right(?![a-zA-Z])/g)?.length ?? 0
  if (left > rightAfter) src = `${src}${' \\right.'.repeat(left - rightAfter)}`
  return src.trim()
}

export function repairStudyMath(text: string): string {
  return repairControlChars(text)
}
