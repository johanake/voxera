import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Licenses from './pages/Licenses'
import Numbers from './pages/Numbers'
import PBX from './pages/PBX'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`${
        isActive
          ? 'text-white font-medium border-b-2 border-primary-300'
          : 'text-gray-300 hover:text-white'
      } pb-1 transition-colors`}
    >
      {children}
    </Link>
  )
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-primary-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-white">
                Voxera
              </Link>
              <div className="flex space-x-6">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/users">Users</NavLink>
                <NavLink to="/licenses">Licenses</NavLink>
                <NavLink to="/numbers">Numbers</NavLink>
                <NavLink to="/pbx">PBX</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <span className="text-sm font-medium text-white">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/licenses" element={<Licenses />} />
          <Route path="/numbers" element={<Numbers />} />
          <Route path="/pbx" element={<PBX />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
