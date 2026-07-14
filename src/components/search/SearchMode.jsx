import SceneSearchPanel from '../research/SceneSearchPanel'

const SearchMode = ({ taleId, chapters, scenes, onOpenScene, onBeforeReplace }) => (
  <div className="flex flex-1 flex-col overflow-hidden">
    <div className="flex shrink-0 items-center border-b border-bronze-dark/30 px-6 py-2">
      <h2 className="font-ui text-xs uppercase tracking-widest text-bronze">Search</h2>
    </div>
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <SceneSearchPanel
          taleId={taleId}
          chapters={chapters}
          scenes={scenes}
          onOpenScene={onOpenScene}
          onBeforeReplace={onBeforeReplace}
        />
      </div>
    </div>
  </div>
)

export default SearchMode
