import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AccessibilityWidget from './components/common/AccessibilityWidget'
import VisualToast from './components/common/VisualToast'

const Home = lazy(() => import('./pages/Home'))
const Session = lazy(() => import('./pages/Session'))
const Dictionary = lazy(() => import('./pages/Dictionary'))
const Guide = lazy(() => import('./pages/Guide'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted">Memuat halaman…</div>}>
        <Routes>
        {/* Dedicated standalone views */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Main portal layout with persistent floating Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/session" element={<Session />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Unknown routes return to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Inclusivity & WCAG Accessibility Support */}
      <AccessibilityWidget />
      <VisualToast />
    </BrowserRouter>
  )
}
