import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import Loading from './pages/Loading'
import './index.css'

const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const ApprovedRoute = lazy(() => import('./components/ApprovedRoute'))
const AdminRoute = lazy(() => import('./components/AdminRoute'))
const SigninPage = lazy(() => import('./pages/SigninPage'))
const ResetPage = lazy(() => import('./pages/ResetPage'))
const RootPage = lazy(() => import('./pages/RootPage'))
const NewTalePage = lazy(() => import('./pages/NewTalePage'))
const TaleEditorPage = lazy(() => import('./pages/TaleEditorPage'))
const AccessPendingPage = lazy(() => import('./pages/AccessPendingPage'))
const AccessAdminPage = lazy(() => import('./pages/AccessAdminPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

const AppShell = () => {
  const { pathname } = useLocation()
  const { loading, isSignedIn } = useAuth()
  // Landing has its own marketing header; hide app NavBar for guests (and while auth loads) on `/`
  const hideNav =
    pathname === '/about' || (pathname === '/' && (loading || !isSignedIn()))

  return (
    <>
      {!hideNav && <NavBar />}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/reset" element={<ResetPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/access-pending"
            element={
              <ProtectedRoute>
                <AccessPendingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<RootPage />} />
          <Route
            path="/new"
            element={
              <ApprovedRoute>
                <NewTalePage />
              </ApprovedRoute>
            }
          />
          <Route
            path="/tale/:taleId"
            element={
              <ApprovedRoute>
                <TaleEditorPage />
              </ApprovedRoute>
            }
          />
          <Route
            path="/admin/access"
            element={
              <AdminRoute>
                <AccessAdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  </QueryClientProvider>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
