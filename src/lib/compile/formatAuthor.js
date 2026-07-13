export function formatAuthorLine(author) {
  const trimmed = author?.trim()
  if (!trimmed) return null
  return `by ${trimmed}`
}
