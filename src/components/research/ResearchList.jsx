import { useEffect, useMemo, useState } from 'react'
import {
  useCreateResearchItem,
  useDeleteResearchItem,
  useUpdateResearchItem,
} from '../../hooks/useReferenceMutations'
import {
  collectUniqueTags,
  filterItemsByTags,
  formatTags,
  parseTags,
  tagsEqual,
} from '../../lib/reference'
import ReferencePinBoard from './ReferencePinBoard'
import { fieldClass, labelClass } from './referenceStyles'

const ResearchDetailForm = ({ item, taleId }) => {
  const update = useUpdateResearchItem(taleId)
  const [title, setTitle] = useState(item.title)
  const [body, setBody] = useState(item.body || '')
  const [url, setUrl] = useState(item.url || '')
  const [tags, setTags] = useState(formatTags(item.tags))

  useEffect(() => {
    setTitle(item.title)
    setBody(item.body || '')
    setUrl(item.url || '')
    setTags(formatTags(item.tags))
  }, [item.id, item.title, item.body, item.url, item.tags])

  const save = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitle(item.title)
      return
    }
    const nextBody = body.trim()
    const nextUrl = url.trim()
    const nextTags = parseTags(tags)

    if (
      trimmedTitle === item.title &&
      nextBody === (item.body || '') &&
      nextUrl === (item.url || '') &&
      tagsEqual(nextTags, item.tags || [])
    ) {
      return
    }

    update.mutate({
      id: item.id,
      title: trimmedTitle,
      body: nextBody,
      url: nextUrl,
      tags: nextTags,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor={`research-title-${item.id}`}>
          Title
        </label>
        <input
          id={`research-title-${item.id}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          className={`${fieldClass} font-ui text-base font-medium`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`research-body-${item.id}`}>
          Notes
        </label>
        <textarea
          id={`research-body-${item.id}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={save}
          rows={10}
          placeholder="Facts, sources, rabbit holes…"
          className={`${fieldClass} resize-y`}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`research-url-${item.id}`}>
          URL
        </label>
        <input
          id={`research-url-${item.id}`}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={save}
          placeholder="https://"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`research-tags-${item.id}`}>
          Tags
        </label>
        <input
          id={`research-tags-${item.id}`}
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onBlur={save}
          placeholder="history, weapons, slang"
          className={fieldClass}
        />
      </div>
    </div>
  )
}

const ResearchList = ({ taleId, researchItems }) => {
  const create = useCreateResearchItem(taleId)
  const del = useDeleteResearchItem(taleId)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  const availableTags = useMemo(() => collectUniqueTags(researchItems), [researchItems])
  const filtered = useMemo(
    () => filterItemsByTags(researchItems, selectedTags),
    [researchItems, selectedTags],
  )
  const selected = filtered.find((item) => item.id === selectedId)
    || researchItems.find((item) => item.id === selectedId)
    || null

  useEffect(() => {
    if (selectedId && !researchItems.some((item) => item.id === selectedId)) {
      setSelectedId(null)
    }
  }, [researchItems, selectedId])

  useEffect(() => {
    setSelectedTags((prev) => prev.filter((tag) => availableTags.includes(tag)))
  }, [availableTags])

  const handleAdd = async () => {
    const created = await create.mutateAsync({
      title: `Note ${researchItems.length + 1}`,
      sortOrder: researchItems.length,
      tags: [],
    })
    setSelectedId(created.id)
  }

  return (
    <ReferencePinBoard
      items={filtered}
      selectedId={selected?.id}
      onSelect={setSelectedId}
      onClearSelection={() => setSelectedId(null)}
      onAdd={handleAdd}
      addLabel="+ Note"
      countLabel={
        selectedTags.length > 0
          ? `${filtered.length} of ${researchItems.length} note${researchItems.length !== 1 ? 's' : ''}`
          : `${researchItems.length} note${researchItems.length !== 1 ? 's' : ''}`
      }
      emptyMessage="No research yet. Stash your sources here."
      emptyFilteredMessage="No notes match the selected tags."
      isAdding={create.isPending}
      availableTags={availableTags}
      selectedTags={selectedTags}
      onSelectedTagsChange={setSelectedTags}
      getCardProps={(item) => ({
        title: item.title,
        eyebrow: item.url ? 'Source' : 'Note',
        preview: item.body || null,
        tags: item.tags || [],
      })}
      detailTitle={selected?.title || 'Research'}
      detailSubtitle={selected?.url || (selected?.tags?.length ? selected.tags.join(', ') : 'Research note')}
      onDelete={
        selected
          ? () => {
              if (window.confirm(`Delete "${selected.title}"?`)) {
                del.mutate(selected.id)
                setSelectedId(null)
              }
            }
          : undefined
      }
      deleteLabel="Delete note"
    >
      {selected && <ResearchDetailForm key={selected.id} item={selected} taleId={taleId} />}
    </ReferencePinBoard>
  )
}

export default ResearchList
