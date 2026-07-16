import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { planLabel } from '../constants/account'

const AccessPendingPage = () => {
  const navigate = useNavigate()
  const { user, plan, signout } = useAuth()

  const handleSignOut = async () => {
    await signout()
    navigate('/')
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-57px)] max-w-lg flex-col items-center justify-center p-8 text-center">
      <h1 className="font-ui text-2xl uppercase tracking-wide text-bronze">Invite Only</h1>
      <p className="mt-4 text-cream/80">
        Write Knuckles is the back room — access is by approval only.
      </p>
      <p className="mt-2 text-cream/60">
        You have a <span className="text-cream">{planLabel(plan)}</span> account signed in as{' '}
        <span className="text-cream">{user?.email}</span>, but this account isn&apos;t on the
        invite list yet.
      </p>
      <p className="mt-6 text-sm text-cream/50">
        If you believe you should have access, contact the magazine editor.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="border border-bronze-dark px-4 py-2 font-ui text-sm uppercase text-cream/80 hover:border-bronze hover:text-bronze"
        >
          Sign Out
        </button>
        <a
          href="https://bronzeknucklesmagazine.com"
          className="border border-bronze-dark px-4 py-2 font-ui text-sm uppercase text-cream/80 hover:border-bronze hover:text-bronze"
        >
          Magazine Site
        </a>
      </div>
      <p className="mt-8 text-xs text-cream/30">
        Already approved? Try signing out and back in after your invite is added.
      </p>
    </div>
  )
}

export default AccessPendingPage
