import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/submit', label: 'Submit' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { session, profile, loading } = useAuth()

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="DEC" className="h-10 w-10 object-contain flex-shrink-0" />
          <div className="hidden sm:block leading-tight min-w-0">
            <p className="font-bold text-blue-900 text-sm truncate">Dhemaji Engineering College</p>
            <p className="text-xs text-gray-400">Student Resource Portal</p>
          </div>
        </Link>

        {/* Nav links + auth */}
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

          {!loading && (
            session && profile ? (
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{profile.username}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-800 text-white hover:bg-blue-900 transition-colors"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
