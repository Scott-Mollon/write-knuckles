import { useEffect, useRef, useState } from 'react'
import { formatChapterNumber, getChapterCustomTitle } from '../../lib/chapters'
import { getTaleTerminology } from '../../lib/taleTerminology'

const titleInputClass =
  'min-w-0 w-full resize-none overflow-hidden break-words rounded border border-transparent bg-transparent px-1 py-0.5 font-ui text-sm font-medium text-cream/80 placeholder:text-cream/30 hover:border-bronze-dark/50 focus:border-bronze focus:outline-none'

const ChapterTitleInput = ({ chapter, chapterIndex, onSave, variant = 'rack', tale = null }) => {
  const [title, setTitle] = useState('')
  const textareaRef = useRef(null)
  const terms = getTaleTerminology(tale)

  useEffect(() => {
    setTitle(getChapterCustomTitle(chapter.title))
  }, [chapter.id, chapter.title])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [title, variant])

  const handleBlur = () => {
    const trimmed = title.trim()
    const current = getChapterCustomTitle(chapter.title)
    if (trimmed !== current) {
      onSave(chapter.id, trimmed)
    }
  }

  const titleField = (
    <textarea
      ref={textareaRef}
      rows={1}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={handleBlur}
      placeholder={variant === 'storyboard' ? 'Title' : terms.chapterTitlePlaceholder}
      className={titleInputClass}
    />
  )

  if (variant === 'storyboard') {
    return (
      <div className="min-w-0 flex-1">
        <div className="font-ui text-sm font-medium uppercase text-bronze">
          {formatChapterNumber(chapterIndex, tale)}
        </div>
        {titleField}
      </div>
    )
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="font-ui text-[10px] uppercase tracking-wide text-cream/40">
        {formatChapterNumber(chapterIndex, tale)}
      </div>
      {titleField}
    </div>
  )
}

export default ChapterTitleInput
