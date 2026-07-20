export const TALE_SORT = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  TITLE: 'title',
}

export const DEFAULT_TALE_SORT = TALE_SORT.NEWEST

const LEADING_ARTICLE = /^(the|a|an)\s+/i

/** Title key for library-style alpha sort (ignores leading The / A / An). */
export function sortableTitle(title) {
  const trimmed = String(title ?? '').trim()
  if (!trimmed) return ''
  const withoutArticle = trimmed.replace(LEADING_ARTICLE, '').trim()
  return withoutArticle || trimmed
}

export function sortTales(tales, mode = DEFAULT_TALE_SORT) {
  if (!tales?.length) return []

  const list = [...tales]

  if (mode === TALE_SORT.TITLE) {
    return list.sort((a, b) =>
      sortableTitle(a.title).localeCompare(sortableTitle(b.title), undefined, {
        sensitivity: 'base',
      }),
    )
  }

  const byCreated = (a, b) => {
    const aTime = Date.parse(a.created_at) || 0
    const bTime = Date.parse(b.created_at) || 0
    return aTime - bTime
  }

  if (mode === TALE_SORT.OLDEST) {
    return list.sort(byCreated)
  }

  return list.sort((a, b) => byCreated(b, a))
}
