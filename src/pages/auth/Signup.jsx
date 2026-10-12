import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    const uname = username.trim().toLowerCase()

    if (uname.length < 3) {
      setError('Username must be at least 3 characters.'); return
    }
    if (!/^[a-z0-9_]+$/.test(uname)) {
      setError('Username can only contain lowercase letters, numbers, and underscores.'); return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.'); return
    }

    setLoading(true)

    // Check if username is already taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', uname)
      .single()

    if (existing) {
      setError('Username is already taken.')
      setLoading(false)
      return
    }

    // Create auth user (using username@decportal.local as fake email)
    const fakeEmail = `${uname}@decportal.app`
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }

    // Create profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      username: uname,
    })

    if (profileErr) {
      setError('Account created but profile failed. Try logging in.')
      setLoading(false)
      return
    }

    navigate('/profile')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="DEC" className="w-14 h-14 object-contain mx-auto mb-3 drop-shadow-sm" />
          <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-400 mt-1">Join the DEC Student Resource Portal</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul_sharma"
                required
                autoComplete="username"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, underscores only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-800 text-white rounded-xl font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
