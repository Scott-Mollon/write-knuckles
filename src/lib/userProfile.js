export function getProfileNames(user) {
  const firstName = user?.user_metadata?.first_name?.trim() || ''
  const lastName = user?.user_metadata?.last_name?.trim() || ''
  return { firstName, lastName }
}

export function getUserDisplayName(user) {
  const { firstName, lastName } = getProfileNames(user)
  const name = [firstName, lastName].filter(Boolean).join(' ')
  return name || user?.email || ''
}
