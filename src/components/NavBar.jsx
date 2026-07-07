import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NavBar = () => {
  const { isSignedIn, signout, user } = useAuth()

  return (
    <nav className="flex items-center justify-between border-b border-bronze-dark px-6 py-3 font-ui uppercase tracking-wide">
      <Link to="/" className="text-bronze text-xl font-semibold hover:text-cream">
        Write Knuckles
      </Link>
      <div className="flex items-center gap-4 text-sm text-cream/80">
        {isSignedIn() ? (
          <>
            <span className="hidden sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={() => signout()}
              className="border border-bronze-dark px-3 py-1 hover:border-bronze hover:text-bronze"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/signin" className="hover:text-bronze">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}

export default NavBar
