import { getHarperLinter } from './linter'
import { writeIgnoredLintsJson } from './prefs'

export async function clearAllIgnoredLints() {
  const linter = await getHarperLinter()
  await linter.clearIgnoredLints()
  writeIgnoredLintsJson('[]')
}
