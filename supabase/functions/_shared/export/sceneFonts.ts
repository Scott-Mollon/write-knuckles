/** Keep in sync with src/constants/sceneFonts.js (SCENE_GOOGLE_FONTS_CSS_URL) */
export const EXPORT_SCENE_GOOGLE_FONTS_URL =
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

/** pdfmake font key → @fontsource npm package name */
export const PDF_FONT_PACKAGES: Record<string, string> = {
  CourierPrime: 'courier-prime',
  CormorantGaramond: 'cormorant-garamond',
  CrimsonPro: 'crimson-pro',
  EBGaramond: 'eb-garamond',
  LibreBaskerville: 'libre-baskerville',
  Literata: 'literata',
  Lora: 'lora',
  Merriweather: 'merriweather',
  NotoSerif: 'noto-serif',
  PTSerif: 'pt-serif',
  SourceSerif4: 'source-serif-4',
}

/** Scene editor font-family CSS value → pdfmake font key */
export const SCENE_FONT_VALUE_TO_PDF_FONT: Record<string, string> = {
  '': 'CourierPrime',
  '"Cormorant Garamond", Garamond, serif': 'CormorantGaramond',
  '"Crimson Pro", Georgia, serif': 'CrimsonPro',
  '"EB Garamond", Garamond, serif': 'EBGaramond',
  '"Libre Baskerville", Baskerville, serif': 'LibreBaskerville',
  'Literata, Georgia, serif': 'Literata',
  'Lora, Georgia, serif': 'Lora',
  'Merriweather, Georgia, serif': 'Merriweather',
  '"Noto Serif", Georgia, serif': 'NotoSerif',
  '"PT Serif", Georgia, serif': 'PTSerif',
  '"Source Serif 4", Georgia, serif': 'SourceSerif4',
  'Baskerville, "Baskerville Old Face", "Palatino Linotype", serif': 'LibreBaskerville',
  '"Book Antiqua", Palatino, serif': 'LibreBaskerville',
  'Cambria, Georgia, serif': 'Literata',
  'Garamond, "Palatino Linotype", Palatino, serif': 'EBGaramond',
  'Georgia, serif': 'Merriweather',
  'Palatino, "Palatino Linotype", "Book Antiqua", serif': 'PTSerif',
  '"Times New Roman", Times, serif': 'PTSerif',
  'Arial, Helvetica, sans-serif': 'Roboto',
  '"Segoe UI", Tahoma, Geneva, sans-serif': 'Roboto',
  'Tahoma, Geneva, sans-serif': 'Roboto',
  '"Trebuchet MS", Helvetica, sans-serif': 'Roboto',
  'Verdana, Geneva, sans-serif': 'Roboto',
  'Consolas, "Courier New", monospace': 'CourierPrime',
  '"Courier New", Courier, monospace': 'CourierPrime',
}

export const PDF_DEFAULT_BODY_FONT = 'CourierPrime'
