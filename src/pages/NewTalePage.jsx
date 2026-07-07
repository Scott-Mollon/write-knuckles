import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBeatTemplates, useCreateTale } from '../hooks/useTales'
import Loading from './Loading'

const NewTalePage = () => {
  const navigate = useNavigate()
  const { data: templates, isLoading } = useBeatTemplates()
  const createTale = useCreateTale()

  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('Pulp')
  const [targetWordCount, setTargetWordCount] = useState(80000)
  const [beatTemplateId, setBeatTemplateId] = useState('')
  const [error, setError] = useState(null)

  if (isLoading) return <Loading />

  const selectedTemplate = templates?.find((t) => t.id === beatTemplateId) || templates?.[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Give your tale a title.')
      return
    }

    const template = selectedTemplate || templates?.[0]
    if (!template) {
      setError('No beat templates found. Run the database migration first.')
      return
    }

    try {
      const tale = await createTale.mutateAsync({
        title: title.trim(),
        genre,
        targetWordCount: Number(targetWordCount),
        beatTemplateId: template.id,
        beatStructure: template.structure,
      })
      navigate(`/tale/${tale.id}`)
    } catch (err) {
      setError(err.message || 'Failed to create tale.')
    }
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">New Tale</h1>
      <p className="mt-2 mb-8 text-cream/70">Set up your manuscript and pick a Beat Sheet.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block font-ui text-sm uppercase text-cream/80">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b-2 border-bronze bg-transparent px-2 py-2 text-cream focus:outline-none"
            placeholder="The Case of the Bronze Knuckle"
          />
        </div>

        <div>
          <label className="mb-2 block font-ui text-sm uppercase text-cream/80">Genre</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full border-b-2 border-bronze bg-transparent px-2 py-2 text-cream focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block font-ui text-sm uppercase text-cream/80">Target Word Count</label>
          <input
            type="number"
            value={targetWordCount}
            onChange={(e) => setTargetWordCount(e.target.value)}
            className="w-full border-b-2 border-bronze bg-transparent px-2 py-2 text-cream focus:outline-none"
            min={1000}
            step={1000}
          />
        </div>

        <div>
          <label className="mb-2 block font-ui text-sm uppercase text-cream/80">Beat Sheet</label>
          <select
            value={beatTemplateId || templates?.[0]?.id || ''}
            onChange={(e) => setBeatTemplateId(e.target.value)}
            className="w-full border-2 border-bronze-dark bg-ink px-3 py-2 text-cream"
          >
            {templates?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {selectedTemplate?.description && (
            <p className="mt-2 text-sm text-cream/50">{selectedTemplate.description}</p>
          )}
        </div>

        {error && <p className="text-error">{error}</p>}

        <button
          type="submit"
          disabled={createTale.isPending}
          className="border-2 border-bronze-dark px-8 py-3 font-ui uppercase tracking-wide text-bronze hover:border-bronze disabled:opacity-50"
        >
          {createTale.isPending ? 'Creating...' : 'Start Your Tale'}
        </button>
      </form>
    </div>
  )
}

export default NewTalePage
