/** Mutable bridge so FileHandler can call async upload logic from SceneEditor. */
let handlers = {
  onPaste: null,
  onDrop: null,
}

export function setSceneImageUploadHandlers(next) {
  handlers = { ...handlers, ...next }
}

export function getSceneImageUploadHandlers() {
  return handlers
}
