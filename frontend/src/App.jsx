import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layouts
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Shared / Student+Staff
import MyDashboard from './pages/dashboard/MyDashboard'
import SurveyBoard from './pages/surveys/SurveyBoard'
import SurveyDetail from './pages/surveys/SurveyDetail'
import MyParticipations from './pages/participations/MyParticipations'
import SubmitParticipation from './pages/participations/SubmitParticipation'
import Leaderboard from './pages/Leaderboard'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import SurveyManagement from './pages/admin/SurveyManagement'
import SurveyEditor from './pages/admin/SurveyEditor'
import ParticipationReview from './pages/admin/ParticipationReview'
import FAQManagement from './pages/admin/FAQManagement'

import LoadingScreen from './components/ui/LoadingScreen'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student / Staff routes */}
      <Route element={<ProtectedRoute allowedRoles={['Student', 'Staff', 'Admin']} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard"              element={<MyDashboard />} />
          <Route path="/surveys"                element={<SurveyBoard />} />
          <Route path="/surveys/:id"            element={<SurveyDetail />} />
          <Route path="/participations"         element={<MyParticipations />} />
          <Route path="/participations/submit"  element={<SubmitParticipation />} />
          <Route path="/leaderboard"            element={<Leaderboard />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"                   element={<AdminDashboard />} />
          <Route path="/admin/users"             element={<UserManagement />} />
          <Route path="/admin/surveys"           element={<SurveyManagement />} />
          <Route path="/admin/surveys/:id/edit"  element={<SurveyEditor />} />
          <Route path="/admin/surveys/new"       element={<SurveyEditor />} />
          <Route path="/admin/participations"    element={<ParticipationReview />} />
          <Route path="/admin/faqs"              element={<FAQManagement />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
