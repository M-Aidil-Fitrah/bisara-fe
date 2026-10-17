import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AccessibilityWidget from './components/common/AccessibilityWidget'
import VisualToast from './components/common/VisualToast'
import Home from './pages/Home'
import Session from './pages/Session'
import Dictionary from './pages/Dictionary'
import Guide from './pages/Guide'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
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

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Inclusivity & WCAG Accessibility Support */}
      <AccessibilityWidget />
      <VisualToast />
    </BrowserRouter>
  )
}

