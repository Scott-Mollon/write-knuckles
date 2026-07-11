export function formatAuthorLine(author: string | null | undefined): string | null {
  const trimmed = author?.trim()
  if (!trimmed) return null
  return `by ${trimmed}`
}
