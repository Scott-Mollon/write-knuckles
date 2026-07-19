/**
 * Tracks which tale's custom dictionary is currently loaded into the
 * Harper LocalLinter singleton. SceneEditor remounts per scene, so this
 * must live outside React hook instance state.
 */
let syncedTaleId = null

export function getHarperLinterSyncedTaleId() {
  return syncedTaleId
}

export function markHarperLinterDictionarySynced(taleId) {
  syncedTaleId = taleId ?? null
}

export function invalidateHarperLinterDictionary() {
  syncedTaleId = null
}
