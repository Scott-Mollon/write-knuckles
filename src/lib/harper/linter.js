import { LocalLinter, Dialect } from 'harper.js'
import { binary } from 'harper.js/binary'

let linterPromise = null

/**
 * Lazy singleton LocalLinter (American English).
 * WorkerLinter is avoided here: Vite serves WASM via a URL that data:-URL workers
 * cannot fetch (opaque origin), so linting fails with zero results and no UI error.
 *
 * Call getDefaultLintConfig after setup so default rules arm (harper.js quirk on some paths).
 */
export async function getHarperLinter() {
  if (!linterPromise) {
    linterPromise = (async () => {
      const linter = new LocalLinter({ binary, dialect: Dialect.American })
      await linter.setup()
      // Materialize defaults into the active rule set, then apply them.
      const defaults = await linter.getDefaultLintConfig()
      await linter.setLintConfig({
        ...defaults,
        AvoidCurses: false,
      })
      return linter
    })().catch((err) => {
      linterPromise = null
      throw err
    })
  }
  return linterPromise
}

export function prefetchHarperLinter() {
  getHarperLinter().catch(() => {
    // Prefetch is best-effort; first enable will surface errors.
  })
}

export function freeLint(lint) {
  try {
    lint?.free?.()
  } catch {
    // already freed
  }
}
