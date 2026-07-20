import { useNavigate } from 'react-router-dom'

const HelpSection = ({ id, title, children }) => {
  const navigate = useNavigate()

  return (
    <section id={id} className="scroll-mt-8 border-b border-bronze-dark/40 pb-10 last:border-b-0">
      <h2 className="mb-4 font-ui text-xl uppercase tracking-wide text-bronze">{title}</h2>
      <div className="space-y-3 font-prose text-sm leading-relaxed text-cream/80 [&_a]:text-bronze [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-cream [&_h3]:mt-5 [&_h3]:font-ui [&_h3]:text-sm [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-cream [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:text-cream [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
      <p className="mt-6">
        <a
          href="#help-top"
          className="inline-block font-ui text-xs uppercase tracking-wide text-bronze hover:text-cream"
          onClick={(event) => {
            event.preventDefault()
            navigate('/help', { preventScrollReset: true })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          ↑ Back to top
        </a>
      </p>
    </section>
  )
}

export default HelpSection
