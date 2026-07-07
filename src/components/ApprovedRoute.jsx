import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../pages/Loading'

const ApprovedRoute = ({ children }) => {
  const { loading, approvalLoading, isSignedIn, approved } = useAuth()

  if (loading || approvalLoading) {
    return <Loading />
  }

  if (!isSignedIn()) {
    return <Navigate to="/signin" replace />
  }

  if (!approved) {
    return <Navigate to="/access-pending" replace />
  }

  return children
}

export default ApprovedRoute
