import {
  SCRIPT_ELEMENT_KEYS,
  getScriptStylePreferences,
  scriptStylesToCssVars,
} from '../editor/scriptStyles.js'

function cssVarsBlock(vars) {
  const lines = Object.entries(vars).map(([name, value]) => `  ${name}: ${value};`)
  return `:root {\n${lines.join('\n')}\n}`
}

/** CSS rules for comic script roles in compiled HTML (mirrors editor styles). */
function buildScriptRoleRules() {
  const blocks = SCRIPT_ELEMENT_KEYS.map((key) => {
    const extra =
      key === 'dialogue'
        ? '  padding-right: var(--script-dialogue-indent);\n'
        : key === 'sfx' || key === 'sfxContent'
          ? '  text-align: var(--script-' + key + '-text-align, center);\n'
          : ''

    return `
.scene-editor-prose[data-tale-type='comic'] .script-role--${key} {
  font-family: var(--script-${key}-font-family);
  font-size: var(--script-${key}-font-size);
  font-weight: var(--script-${key}-font-weight);
  font-style: var(--script-${key}-font-style, normal);
  text-align: var(--script-${key}-text-align);
  text-transform: var(--script-${key}-text-transform);
  letter-spacing: var(--script-${key}-letter-spacing);
  line-height: var(--script-${key}-line-height);
  margin-top: var(--script-${key}-margin-top);
  margin-bottom: var(--script-${key}-margin-bottom);
  padding-left: var(--script-${key}-indent);
${extra}}`
  })

  return blocks.join('\n')
}

export function buildCompileScriptStyles(prefsOrTale) {
  const prefs = getScriptStylePreferences(prefsOrTale)
  const vars = scriptStylesToCssVars(prefs)
  return `${cssVarsBlock(vars)}\n${buildScriptRoleRules()}`
}

export function applyScriptTextTransform(text, scriptRole, prefsOrTale) {
  if (!scriptRole || text == null) return text

  const prefs = getScriptStylePreferences(prefsOrTale)
  const transform = prefs[scriptRole]?.textTransform || 'none'

  switch (transform) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'capitalize':
      return text.replace(/\b(\w)/g, (match) => match.toUpperCase())
    default:
      return text
  }
}
