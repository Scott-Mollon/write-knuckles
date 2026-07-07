import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import NavBar from './components/NavBar'
import Loading from './pages/Loading'
import './index.css'

const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const ApprovedRoute = lazy(() => import('./components/ApprovedRoute'))
const AdminRoute = lazy(() => import('./components/AdminRoute'))
const SigninPage = lazy(() => import('./pages/SigninPage'))
const ResetPage = lazy(() => import('./pages/ResetPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NewTalePage = lazy(() => import('./pages/NewTalePage'))
const TaleEditorPage = lazy(() => import('./pages/TaleEditorPage'))
const AccessPendingPage = lazy(() => import('./pages/AccessPendingPage'))
const AccessAdminPage = lazy(() => import('./pages/AccessAdminPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <NavBar />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/reset" element={<ResetPage />} />
            <Route
              path="/access-pending"
              element={
                <ProtectedRoute>
                  <AccessPendingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ApprovedRoute>
                  <DashboardPage />
                </ApprovedRoute>
              }
            />
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
      </AuthProvider>
    </Router>
  </QueryClientProvider>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
