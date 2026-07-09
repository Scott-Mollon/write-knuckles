let confirmHandler = null

export function registerConfirmHandler(handler) {
  confirmHandler = handler
}

async function runConfirm(options) {
  if (confirmHandler) {
    return confirmHandler(options)
  }
  return window.confirm(options.message)
}

function normalizeOptions(messageOrOptions, defaults = {}) {
  if (typeof messageOrOptions === 'string') {
    return { message: messageOrOptions, ...defaults }
  }
  return { ...defaults, ...messageOrOptions }
}

/** @returns {Promise<boolean>} true when the user confirms the action */
export async function confirmAction(messageOrOptions) {
  return runConfirm(normalizeOptions(messageOrOptions))
}

/** @returns {Promise<boolean>} true when the user confirms a destructive delete */
export async function confirmDelete(label, { irreversible = false } = {}) {
  const suffix = irreversible ? ' This cannot be undone.' : ''
  return confirmAction({
    message: `Delete ${label}?${suffix}`,
    confirmLabel: 'Delete',
    destructive: true,
  })
}

/** @returns {Promise<boolean>} true when the user confirms removing an association */
export async function confirmUnlink(label) {
  return confirmAction({
    message: `Unlink ${label}?`,
    confirmLabel: 'Unlink',
    destructive: true,
  })
}
