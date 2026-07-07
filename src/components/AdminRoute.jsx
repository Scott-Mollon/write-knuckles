import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../pages/Loading'

const AdminRoute = ({ children }) => {
  const { loading, isSignedIn, admin } = useAuth()

  if (loading) return <Loading />

  if (!isSignedIn()) {
    return <Navigate to="/signin" replace />
  }

  if (!admin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
