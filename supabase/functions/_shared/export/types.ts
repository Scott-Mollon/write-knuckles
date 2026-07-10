export type ExportFormat = 'txt' | 'pdf' | 'docx'

export type ExportOptions = {
  includeChapterWord: boolean
  includeChapterNumber: boolean
  includeChapterTitle: boolean
  titlePage: boolean
  chapterPageBreak: boolean
  includeCover: boolean
  includeImagePlaceholders: boolean
}

export type ExportScope = {
  chapterIds: string[]
  sceneIds: string[]
}

export type ExportRequest = {
  taleId: string
  format: ExportFormat
  options: ExportOptions
  scope: ExportScope
}

export type InlineMark = 'bold' | 'italic' | 'underline' | 'link'

export type InlineSpan = {
  text: string
  marks: InlineMark[]
  href?: string
}

export type ContentBlock =
  | { type: 'paragraph'; spans: InlineSpan[]; textAlign?: string }
  | { type: 'heading'; level: number; spans: InlineSpan[] }
  | { type: 'divider' }
  | { type: 'image'; alt: string }

export type ManuscriptScene = {
  id: string
  blocks: ContentBlock[]
}

export type ManuscriptChapter = {
  id: string
  heading: string | null
  scenes: ManuscriptScene[]
}

export type ManuscriptModel = {
  title: string
  author: string | null
  subtitle: string | null
  chapters: ManuscriptChapter[]
}

export type TaleRow = {
  id: string
  user_id: string
  title: string
  author: string | null
  subtitle: string | null
}

export type ChapterRow = {
  id: string
  tale_id: string
  title: string | null
  sort_order: number
}

export type SceneRow = {
  id: string
  chapter_id: string
  tale_id: string
  title: string
  sort_order: number
  content: unknown
  plain_text: string | null
}
