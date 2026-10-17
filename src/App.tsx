import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AccessibilityWidget from './components/common/AccessibilityWidget'
import VisualToast from './components/common/VisualToast'
import MainLayout from './components/layout/MainLayout'

const Home = lazy(() => import('./pages/Home'))
const Dictionary = lazy(() => import('./pages/Dictionary'))
const Guide = lazy(() => import('./pages/Guide'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const LayananPsikolog = lazy(() => import('./pages/LayananPsikolog'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const OneWay = lazy(() => import('./pages/OneWay'))
const Ritz = lazy(() => import('./pages/Ritz'))
const Display = lazy(() => import('./pages/Display'))
const Meet = lazy(() => import('./pages/Meet'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

function RouteFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-muted" role="status">
      Memuat layanan…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Standalone Fullscreen Pages */}
          <Route path="/display/:token" element={<Display />} />
          <Route path="/meet/:partner" element={<Meet />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Layout Pages */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            {/* Public Service Core Endpoints */}
            <Route path="/one-way" element={<OneWay />} />
            <Route path="/two-way" element={<Services />} />
            <Route path="/two-way/layanan-psikolog" element={<LayananPsikolog />} />
            <Route path="/two-way/layanan-psikolog/ritz" element={<Ritz />} />
            <Route path="/two-way/:service" element={<ComingSoon />} />
            <Route path="/ritz" element={<Ritz />} />
            <Route path="/session" element={<Navigate to="/ritz" replace />} />
            <Route path="/fitur" element={<Navigate to="/two-way" replace />} />

            {/* Informational Pages */}
            <Route path="/dictionary" element={<Dictionary />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/about" element={<About />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <AccessibilityWidget />
      <VisualToast />
    </BrowserRouter>
  )
}
