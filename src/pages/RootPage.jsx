import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from './Loading'
import LandingPage from './LandingPage'

const DashboardPage = lazy(() => import('./DashboardPage'))

const RootPage = () => {
  const { loading, approvalLoading, isSignedIn, approved } = useAuth()

  if (loading || approvalLoading) {
    return <Loading />
  }

  if (!isSignedIn()) {
    return <LandingPage />
  }

  if (!approved) {
    return <Navigate to="/access-pending" replace />
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardPage />
    </Suspense>
  )
}

export default RootPage
