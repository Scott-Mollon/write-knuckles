/** Keep EXPORT_SCENE_GOOGLE_FONTS_URL in sync with supabase/functions/_shared/export/sceneFonts.ts */
export const SCENE_GOOGLE_FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2' +
  '?family=Courier+Prime:ital,wght@0,400;0,700;1,400' +
  '&family=EB+Garamond:ital,wght@0,400;0,700;1,400' +
  '&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400' +
  '&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400' +
  '&family=Lora:ital,wght@0,400;0,700;1,400' +
  '&family=Merriweather:ital,opsz,wght@0,18..144,400;0,18..144,700;1,18..144,400' +
  '&family=Crimson+Pro:ital,wght@0,400;0,700;1,400' +
  '&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400' +
  '&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,700;1,8..60,400' +
  '&family=PT+Serif:ital,wght@0,400;0,700;1,400' +
  '&family=Noto+Serif:ital,wght@0,400;0,700;1,400' +
  '&family=Oswald:wght@400;500;600' +
  '&display=swap'

export const DEFAULT_SCENE_PROSE_FONT = '"Times New Roman", Times, serif'

export const SCENE_FONT_GROUPS = [
  { id: 'web', label: 'Web fonts' },
  { id: 'serif', label: 'System serif' },
  { id: 'sans', label: 'System sans' },
  { id: 'mono', label: 'System mono' },
]

export const SCENE_FONT_OPTIONS = [
  { label: 'Courier Prime', value: '"Courier Prime", monospace', group: 'web' },
  { label: 'Cormorant Garamond', value: '"Cormorant Garamond", Garamond, serif', group: 'web' },
  { label: 'Crimson Pro', value: '"Crimson Pro", Georgia, serif', group: 'web' },
  { label: 'EB Garamond', value: '"EB Garamond", Garamond, serif', group: 'web' },
  { label: 'Libre Baskerville', value: '"Libre Baskerville", Baskerville, serif', group: 'web' },
  { label: 'Literata', value: 'Literata, Georgia, serif', group: 'web' },
  { label: 'Lora', value: 'Lora, Georgia, serif', group: 'web' },
  { label: 'Merriweather', value: 'Merriweather, Georgia, serif', group: 'web' },
  { label: 'Noto Serif', value: '"Noto Serif", Georgia, serif', group: 'web' },
  { label: 'PT Serif', value: '"PT Serif", Georgia, serif', group: 'web' },
  { label: 'Source Serif 4', value: '"Source Serif 4", Georgia, serif', group: 'web' },
  { label: 'Baskerville', value: 'Baskerville, "Baskerville Old Face", "Palatino Linotype", serif', group: 'serif' },
  { label: 'Book Antiqua', value: '"Book Antiqua", Palatino, serif', group: 'serif' },
  { label: 'Cambria', value: 'Cambria, Georgia, serif', group: 'serif' },
  { label: 'Garamond', value: 'Garamond, "Palatino Linotype", Palatino, serif', group: 'serif' },
  { label: 'Georgia', value: 'Georgia, serif', group: 'serif' },
  { label: 'Palatino', value: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', group: 'serif' },
  { label: 'Times New Roman', value: DEFAULT_SCENE_PROSE_FONT, group: 'serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif', group: 'sans' },
  { label: 'Segoe UI', value: '"Segoe UI", Tahoma, Geneva, sans-serif', group: 'sans' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif', group: 'sans' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif', group: 'sans' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif', group: 'sans' },
  { label: 'Consolas', value: 'Consolas, "Courier New", monospace', group: 'mono' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace', group: 'mono' },
]

export function sceneFontPreviewFamily(value, fallback = DEFAULT_SCENE_PROSE_FONT) {
  return value || fallback
}

export function isValidSceneFontFamily(value) {
  return SCENE_FONT_OPTIONS.some((font) => font.value === value)
}
