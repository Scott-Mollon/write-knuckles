import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  useFeatureRequests,
  useCreateFeatureRequest,
  useToggleFeatureRequestVote,
  useUpdateFeatureRequest,
  useDeleteFeatureRequest,
  useMergeFeatureRequests,
} from '../hooks/useFeatureRequests'
import { confirmAction, confirmDelete } from '../lib/confirmAction'
import Loading from './Loading'

const inputClass =
  'w-full rounded border border-bronze-dark/50 bg-ink px-3 py-2 text-cream focus:border-bronze focus:outline-none'

const FeatureRequestCard = ({
  request,
  allRequests,
  admin,
  onError,
}) => {
  const toggleVote = useToggleFeatureRequestVote()
  const updateRequest = useUpdateFeatureRequest()
  const deleteRequest = useDeleteFeatureRequest()
  const mergeRequests = useMergeFeatureRequests()

  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(request.title)
  const [editDescription, setEditDescription] = useState(request.description)
  const [mergeTargetId, setMergeTargetId] = useState('')

  const otherRequests = allRequests.filter((r) => r.id !== request.id)
  const isBusy =
    toggleVote.isPending ||
    updateRequest.isPending ||
    deleteRequest.isPending ||
    mergeRequests.isPending

  const handleVote = async () => {
    onError(null)
    try {
      await toggleVote.mutateAsync({
        featureRequestId: request.id,
        userHasVoted: request.user_has_voted,
      })
    } catch (err) {
      onError(err.message || 'Failed to update vote.')
    }
  }

  const startEdit = () => {
    setEditTitle(request.title)
    setEditDescription(request.description)
    setEditing(true)
    onError(null)
  }

  const cancelEdit = () => {
    setEditing(false)
    setEditTitle(request.title)
    setEditDescription(request.description)
  }

  const handleSaveEdit = async () => {
    onError(null)
    if (!editTitle.trim() || !editDescription.trim()) {
      onError('Title and description are required.')
      return
    }

    try {
      await updateRequest.mutateAsync({
        id: request.id,
        title: editTitle,
        description: editDescription,
      })
      setEditing(false)
    } catch (err) {
      onError(err.message || 'Failed to update feature request.')
    }
  }

  const handleDelete = async () => {
    if (!(await confirmDelete(`"${request.title}"`, { irreversible: true }))) return

    onError(null)
    try {
      await deleteRequest.mutateAsync(request.id)
    } catch (err) {
      onError(err.message || 'Failed to delete feature request.')
    }
  }

  const handleMerge = async () => {
    if (!mergeTargetId) {
      onError('Select a request to merge into.')
      return
    }

    const target = allRequests.find((r) => r.id === mergeTargetId)
    if (!(await confirmAction(
      `Merge "${request.title}" into "${target?.title}"? Votes will be combined and this request will be removed.`,
    ))) {
      return
    }

    onError(null)
    try {
      await mergeRequests.mutateAsync({
        sourceId: request.id,
        targetId: mergeTargetId,
      })
      setMergeTargetId('')
    } catch (err) {
      onError(err.message || 'Failed to merge feature requests.')
    }
  }

  return (
    <li className="flex gap-4 rounded border border-bronze-dark/50 bg-surface/20 p-4">
      <button
        type="button"
        onClick={handleVote}
        disabled={isBusy}
        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded border font-ui text-sm transition-colors disabled:opacity-50 ${
          request.user_has_voted
            ? 'border-bronze bg-bronze/20 text-bronze'
            : 'border-bronze-dark/50 text-cream/60 hover:border-bronze hover:text-bronze'
        }`}
        aria-pressed={request.user_has_voted}
        aria-label={request.user_has_voted ? 'Remove upvote' : 'Upvote'}
      >
        <span className="text-lg leading-none">▲</span>
        <span>{request.vote_count}</span>
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={inputClass}
              placeholder="Title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className={`${inputClass} resize-y`}
              placeholder="Description"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isBusy}
                className="border border-bronze bg-bronze/20 px-3 py-1 font-ui text-xs uppercase text-bronze hover:bg-bronze/30 disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isBusy}
                className="px-3 py-1 font-ui text-xs uppercase text-cream/50 hover:text-cream disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-ui text-lg text-bronze">{request.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-cream/80">{request.description}</p>
            <p className="mt-3 text-xs text-cream/40">
              {new Date(request.created_at).toLocaleDateString()}
            </p>
          </>
        )}

        {admin && !editing && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-bronze-dark/30 pt-3">
            <button
              type="button"
              onClick={startEdit}
              disabled={isBusy}
              className="font-ui text-xs uppercase text-bronze hover:text-cream disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isBusy}
              className="font-ui text-xs uppercase text-cream/40 hover:text-error disabled:opacity-50"
            >
              Delete
            </button>
            {otherRequests.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  disabled={isBusy}
                  className="rounded border border-bronze-dark/50 bg-ink px-2 py-1 text-xs text-cream focus:border-bronze focus:outline-none"
                >
                  <option value="">Merge into…</option>
                  {otherRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={isBusy || !mergeTargetId}
                  className="font-ui text-xs uppercase text-cream/50 hover:text-bronze disabled:opacity-50"
                >
                  Merge
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

const FeatureRequestPage = () => {
  const { admin } = useAuth()
  const { data: requests, isLoading, error } = useFeatureRequests()
  const createRequest = useCreateFeatureRequest()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState(null)
  const [cardError, setCardError] = useState(null)

  if (isLoading) return <Loading />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.')
      return
    }

    try {
      await createRequest.mutateAsync({ title, description })
      setTitle('')
      setDescription('')
    } catch (err) {
      setFormError(err.message || 'Failed to submit feature request.')
    }
  }

  const list = requests || []

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8">
        <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">Feature Requests</h1>
        <p className="mt-2 text-cream/70">
          Suggest improvements and upvote ideas you want to see built.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-10 rounded border border-bronze-dark/50 bg-surface/30 p-4"
      >
        <h2 className="mb-4 font-ui text-sm uppercase text-bronze">Submit a request</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short title"
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the feature and why it would help"
            rows={4}
            className={`${inputClass} resize-y`}
          />
          <button
            type="submit"
            disabled={createRequest.isPending}
            className="border border-bronze bg-bronze/20 px-4 py-2 font-ui text-sm uppercase text-bronze hover:bg-bronze/30 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
        {formError && <p className="mt-2 text-sm text-error">{formError}</p>}
      </form>

      {error && (
        <p className="mb-6 text-error">
          Could not load feature requests. Ensure migration 016 has been applied.
        </p>
      )}

      {cardError && <p className="mb-4 text-sm text-error">{cardError}</p>}

      {list.length === 0 ? (
        <p className="text-sm text-cream/40">No feature requests yet. Be the first to submit one.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((request) => (
            <FeatureRequestCard
              key={request.id}
              request={request}
              allRequests={list}
              admin={admin}
              onError={setCardError}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default FeatureRequestPage
