import pdfMake from 'npm:pdfmake/build/pdfmake.js'
import {
  PDF_DEFAULT_BODY_FONT,
  PDF_FONT_PACKAGES,
  SCENE_FONT_VALUE_TO_PDF_FONT,
} from './sceneFonts.ts'
import type { ManuscriptModel } from './types.ts'

const FONTSOURCE_VERSION = '5.2.5'
const FONTSOURCE_CDN = `https://cdn.jsdelivr.net/npm/@fontsource`

const registeredFonts = new Set<string>(['Roboto'])
const failedFonts = new Set<string>()

export function resolvePdfFontKey(fontFamily?: string): string {
  if (!fontFamily) return PDF_DEFAULT_BODY_FONT
  return SCENE_FONT_VALUE_TO_PDF_FONT[fontFamily] ?? PDF_DEFAULT_BODY_FONT
}

export function pdfFontForRender(fontKey: string): string {
  if (failedFonts.has(fontKey)) return 'Roboto'
  if (fontKey === 'Roboto') return 'Roboto'
  if (registeredFonts.has(fontKey) && PDF_FONT_PACKAGES[fontKey]) return fontKey
  return 'Roboto'
}

export function pxToPdfFontSize(px: number): number {
  return Math.round(px * 0.75 * 10) / 10
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

async function fetchFontFile(packageName: string, fileName: string): Promise<string> {
  const url = `${FONTSOURCE_CDN}/${packageName}@${FONTSOURCE_VERSION}/files/${fileName}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load font file ${fileName} (${response.status})`)
  }
  const bytes = new Uint8Array(await response.arrayBuffer())
  return bytesToBase64(bytes)
}

async function registerPdfFont(fontKey: string, vfs: Record<string, string>): Promise<void> {
  if (fontKey === 'Roboto' || registeredFonts.has(fontKey)) return

  const packageName = PDF_FONT_PACKAGES[fontKey]
  if (!packageName) {
    registeredFonts.add(fontKey)
    return
  }

  const normal = `${packageName}-latin-400-normal.woff2`
  const bold = `${packageName}-latin-700-normal.woff2`
  const italics = `${packageName}-latin-400-italic.woff2`
  const bolditalics = `${packageName}-latin-700-italic.woff2`

  try {
    const [normalData, boldData, italicsData, bolditalicsData] = await Promise.all([
      fetchFontFile(packageName, normal),
      fetchFontFile(packageName, bold),
      fetchFontFile(packageName, italics),
      fetchFontFile(packageName, bolditalics),
    ])

    vfs[normal] = normalData
    vfs[bold] = boldData
    vfs[italics] = italicsData
    vfs[bolditalics] = bolditalicsData

    pdfMake.fonts = {
      ...pdfMake.fonts,
      [fontKey]: {
        normal,
        bold,
        italics,
        bolditalics,
      },
    }

    registeredFonts.add(fontKey)
  } catch (err) {
    console.error(`pdf font registration failed for ${fontKey}:`, err)
    failedFonts.add(fontKey)
  }
}

export function collectPdfFontsFromModel(model: ManuscriptModel): Set<string> {
  const fonts = new Set<string>([PDF_DEFAULT_BODY_FONT, 'Roboto'])

  for (const chapter of model.chapters) {
    for (const scene of chapter.scenes) {
      for (const block of scene.blocks) {
        if (block.type !== 'paragraph' && block.type !== 'heading') continue
        for (const span of block.spans) {
          fonts.add(resolvePdfFontKey(span.fontFamily))
        }
      }
    }
  }

  return fonts
}

export async function ensurePdfFonts(
  fontKeys: Iterable<string>,
  vfs: Record<string, string>,
): Promise<void> {
  pdfMake.vfs = { ...pdfMake.vfs, ...vfs }
  await Promise.all([...fontKeys].map((fontKey) => registerPdfFont(fontKey, pdfMake.vfs)))
}
