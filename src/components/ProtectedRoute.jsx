import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../pages/Loading'

const ProtectedRoute = ({ children }) => {
  const { loading, isSignedIn } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!isSignedIn()) {
    return <Navigate to="/signin" replace />
  }

  return children
}

export default ProtectedRoute
