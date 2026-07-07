export const SCENE_EDITOR_PLACEHOLDERS = [
  'The rain started before the trouble did.',
  'Another night, another wrong turn.',
  'He hit the pavement hard. Harder than he expected.',
  'The door kicked open. So did everything else.',
  'Someone left a body and a question.',
  "He'd lied before. This time he almost believed himself.",
  "Noir doesn't knock. It kicks the door in.",
  'Write it raw. Polish it later.',
  "The reader's waiting. Don't keep them in the dark.",
  'Type one true thing. Then make it worse.',
  "Someone's about to regret this chapter.",
  'The first sentence is always the hardest punch.',
  'Empty page. Full stakes.',
]

export const pickRandomScenePlaceholder = () => {
  const index = Math.floor(Math.random() * SCENE_EDITOR_PLACEHOLDERS.length)
  return SCENE_EDITOR_PLACEHOLDERS[index]
}
