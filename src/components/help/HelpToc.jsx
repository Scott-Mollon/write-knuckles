import { HELP_TOPICS } from './helpTopics'

const HelpToc = ({ className = '', onNavigate, showHeading = true }) => (
  <nav aria-label="Help contents" className={className}>
    {showHeading && (
      <h2 className="mb-3 font-ui text-sm uppercase tracking-wide text-bronze">Contents</h2>
    )}
    <ol className="space-y-2 font-ui text-xs uppercase tracking-wide text-cream/70">
      {HELP_TOPICS.map((topic, index) => (
        <li key={topic.id}>
          <a
            href={`#${topic.id}`}
            className="block rounded px-1 py-0.5 hover:bg-bronze/20 hover:text-bronze"
            onClick={(event) => onNavigate?.(event, topic.id)}
          >
            <span className="mr-2 text-cream/35">{index + 1}.</span>
            {topic.title}
          </a>
        </li>
      ))}
    </ol>
  </nav>
)

export default HelpToc
