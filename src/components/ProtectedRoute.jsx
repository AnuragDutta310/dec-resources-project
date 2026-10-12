import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      // Verify user is in admin_users table
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      setIsAdmin(!!data)
      setLoading(false)
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check()
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fadeIn">
          <p className="text-4xl mb-4">🚫</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-400 mb-6">You don't have admin privileges.</p>
          <a href="/" className="px-6 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return children
}
