import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { canCreateTale, FREE_TALE_LIMIT_MESSAGE } from '../constants/account'
import { TALE_TYPE_LABELS, TALE_TYPES } from '../constants/taleTypes'
import { useAuth } from '../contexts/AuthContext'
import { useBeatTemplates, useCreateTale, useTales } from '../hooks/useTales'
import { isComicTale } from '../lib/taleTerminology'
import Loading from './Loading'

const NewTalePage = () => {
  const navigate = useNavigate()
  const { plan } = useAuth()
  const { data: tales, isLoading: talesLoading } = useTales()
  const { data: templates, isLoading: templatesLoading } = useBeatTemplates()
  const createTale = useCreateTale()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('Pulp')
  const [targetWordCount, setTargetWordCount] = useState(80000)
  const [taleType, setTaleType] = useState(TALE_TYPES.PROSE)
  const [beatTemplateId, setBeatTemplateId] = useState('')
  const [error, setError] = useState(null)

  if (talesLoading || templatesLoading) return <Loading />

  const taleCount = tales?.length ?? 0
  const allowNewTale = canCreateTale({ plan, taleCount })
  const comic = isComicTale(taleType)

  if (!allowNewTale) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">New Tale</h1>
        <p className="mt-4 text-cream/70">{FREE_TALE_LIMIT_MESSAGE}</p>
        <Link to="/" className="mt-8 inline-block text-bronze underline hover:text-cream">
          &larr; Back to your tales
        </Link>
      </div>
    )
  }

  const selectedTemplate = templates?.find((t) => t.id === beatTemplateId) || templates?.[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Give your tale a title.')
      return
    }

    if (!comic) {
      const template = selectedTemplate || templates?.[0]
      if (!template) {
        setError('No beat templates found. Run the database migration first.')
        return
      }

      try {
        const tale = await createTale.mutateAsync({
          title: title.trim(),
          author: author.trim(),
          genre,
          targetWordCount: Number(targetWordCount),
          taleType: TALE_TYPES.PROSE,
          beatTemplateId: template.id,
          beatStructure: template.structure,
        })
        navigate(`/tale/${tale.id}`)
      } catch (err) {
        setError(err.message || 'Failed to create tale.')
      }
      return
    }

    try {
      const tale = await createTale.mutateAsync({
        title: title.trim(),
        author: author.trim(),
        genre,
        taleType: TALE_TYPES.COMIC,
      })
      navigate(`/tale/${tale.id}`)
    } catch (err) {
      setError(err.message || 'Failed to create tale.')
    }
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">New Tale</h1>
      <p className="mt-2 mb-8 text-cream/70">
        {comic
          ? 'Set up your comic script with Issues and Pages.'
          : 'Set up your manuscript and pick a Beat Sheet.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block font-ui text-sm uppercase text-cream/80">Type</label>
          <div className="flex gap-2">
            {[TALE_TYPES.PROSE, TALE_TYPES.COMIC].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTaleType(type)}
                className={`flex-1 border-2 px-3 py-2 font-ui text-sm uppercase tracking-wide transition ${
                  taleType === type
                    ? 'border-bronze bg-bronze/20 text-bronze'
                    : 'border-bronze-dark/50 text-cream/60 hover:border-bronze hover:text-cream'
                }`}
              >
                {TALE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-cream/50">
            Type is set at creation and cannot be changed later.
          </p>
        </div>

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
          <label className="mb-2 block font-ui text-sm uppercase text-cream/80">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border-b-2 border-bronze bg-transparent px-2 py-2 text-cream focus:outline-none"
            placeholder="Your name or pen name"
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

        {!comic && (
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
        )}

        {!comic && (
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
        )}

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
