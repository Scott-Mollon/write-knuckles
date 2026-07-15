export const SCRIPT_ROLES = {
  PANEL: 'panel',
  PANEL_DESCRIPTION: 'panelDescription',
  CHARACTER: 'character',
  CHARACTER_DESCRIPTOR: 'characterDescriptor',
  DIALOGUE: 'dialogue',
  SFX: 'sfx',
  SFX_CONTENT: 'sfxContent',
}

/** Starter text inserted with each script toolbar action (selected for easy overwrite). */
export const SCRIPT_ROLE_PLACEHOLDERS = {
  [SCRIPT_ROLES.PANEL_DESCRIPTION]: 'Panel description.',
  [SCRIPT_ROLES.CHARACTER]: 'CHARACTER NAME',
  [SCRIPT_ROLES.CHARACTER_DESCRIPTOR]: '(descriptor)',
  [SCRIPT_ROLES.DIALOGUE]: 'Dialogue.',
  [SCRIPT_ROLES.SFX]: 'SFX',
  [SCRIPT_ROLES.SFX_CONTENT]: 'KABOOM!',
}

export const SCRIPT_ELEMENT_KEYS = [
  'panel',
  'panelDescription',
  'character',
  'characterDescriptor',
  'dialogue',
  'sfx',
  'sfxContent',
]

export const SCRIPT_ELEMENT_LABELS = {
  panel: 'Panel indicator',
  panelDescription: 'Panel description',
  character: 'Character name',
  characterDescriptor: 'Character descriptor',
  dialogue: 'Dialogue',
  sfx: 'SFX indicator',
  sfxContent: 'SFX',
}

/** Sample lines shown in Script settings live previews. */
export const SCRIPT_ELEMENT_PREVIEW_SAMPLES = {
  panel: 'Panel 1',
  panelDescription: 'Wide establishing shot of the city at dusk.',
  character: 'CHARACTER NAME',
  characterDescriptor: '(from off-panel)',
  dialogue: 'Looks like rain.',
  sfx: 'SFX',
  sfxContent: 'KABOOM!',
}

/** Classic comic-script defaults applied when prefs are empty / partial. */
export const DEFAULT_SCRIPT_STYLE_PREFERENCES = {
  panel: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    lineHeight: '1.3',
    marginTop: '1em',
    marginBottom: '0.25em',
    indent: '0',
  },
  panelDescription: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '13px',
    fontWeight: '400',
    textAlign: 'left',
    textTransform: 'none',
    letterSpacing: '0',
    lineHeight: '1.45',
    marginTop: '0',
    marginBottom: '0.5em',
    indent: '0',
  },
  character: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    lineHeight: '1.3',
    marginTop: '0.75em',
    marginBottom: '0',
    indent: '0',
  },
  characterDescriptor: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '12px',
    fontWeight: '400',
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: '0',
    lineHeight: '1.3',
    marginTop: '0',
    marginBottom: '0',
    indent: '0',
    fontStyle: 'italic',
  },
  dialogue: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '13px',
    fontWeight: '400',
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: '0',
    lineHeight: '1.45',
    marginTop: '0',
    marginBottom: '0.5em',
    indent: '2em',
  },
  sfx: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    lineHeight: '1.3',
    marginTop: '0.75em',
    marginBottom: '0',
    indent: '0',
  },
  sfxContent: {
    fontFamily: 'Courier Prime, Courier New, monospace',
    fontSize: '14px',
    fontWeight: '400',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    lineHeight: '1.3',
    marginTop: '0',
    marginBottom: '0.5em',
    indent: '0',
  },
}

const STYLE_KEYS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'textAlign',
  'textTransform',
  'letterSpacing',
  'lineHeight',
  'marginTop',
  'marginBottom',
  'indent',
  'fontStyle',
]

export function getScriptStylePreferences(tale) {
  const raw = tale?.script_style_preferences
  const stored = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const merged = {}
  for (const key of SCRIPT_ELEMENT_KEYS) {
    merged[key] = {
      ...DEFAULT_SCRIPT_STYLE_PREFERENCES[key],
      ...(stored[key] && typeof stored[key] === 'object' ? stored[key] : {}),
    }
  }
  return merged
}

/** Fresh copy of built-in script element styles (for Reset to defaults). */
export function cloneDefaultScriptStylePreferences() {
  return getScriptStylePreferences(null)
}

export function serializeScriptStylePreferences(prefs) {
  const out = {}
  for (const key of SCRIPT_ELEMENT_KEYS) {
    const src = prefs?.[key] || {}
    const row = {}
    for (const sk of STYLE_KEYS) {
      if (src[sk] != null && src[sk] !== '') row[sk] = String(src[sk])
    }
    out[key] = row
  }
  return out
}

/** CSS custom properties for live editor / export. */
export function scriptStylesToCssVars(prefsOrTale) {
  const styles =
    prefsOrTale?.panel && prefsOrTale?.dialogue
      ? prefsOrTale
      : getScriptStylePreferences(prefsOrTale)
  const vars = {}
  for (const key of SCRIPT_ELEMENT_KEYS) {
    const s = styles[key] || DEFAULT_SCRIPT_STYLE_PREFERENCES[key]
    vars[`--script-${key}-font-family`] = s.fontFamily
    vars[`--script-${key}-font-size`] = s.fontSize
    vars[`--script-${key}-font-weight`] = s.fontWeight
    vars[`--script-${key}-text-align`] = s.textAlign
    vars[`--script-${key}-text-transform`] = s.textTransform
    vars[`--script-${key}-letter-spacing`] = s.letterSpacing
    vars[`--script-${key}-line-height`] = s.lineHeight
    vars[`--script-${key}-margin-top`] = s.marginTop
    vars[`--script-${key}-margin-bottom`] = s.marginBottom
    vars[`--script-${key}-indent`] = s.indent
    vars[`--script-${key}-font-style`] = s.fontStyle || 'normal'
  }
  return vars
}
