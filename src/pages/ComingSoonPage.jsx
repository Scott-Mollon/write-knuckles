import { Link } from 'react-router-dom'

const ComingSoonPage = ({ title }) => (
  <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <h1 className="font-ui text-3xl uppercase tracking-wide text-bronze">{title}</h1>
    <p className="font-prose text-cream/70">Coming Soon</p>
    <Link to="/" className="mt-4 font-ui text-sm uppercase tracking-wide text-cream/60 hover:text-bronze">
      Back to home
    </Link>
  </div>
)

export default ComingSoonPage
