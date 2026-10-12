import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const statusConfig = {
  approved: { label: 'Submitted',    icon: '✅', bg: 'bg-green-50  text-green-700' },
  pending:  { label: 'Under Review', icon: '⏳', bg: 'bg-orange-50 text-orange-600' },
  rejected: { label: 'Rejected',     icon: '❌', bg: 'bg-red-50    text-red-600' },
}

export default function Profile() {
  const { session, profile, loading: authLoading, logout } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!session) { navigate('/login'); return }

    supabase
      .from('submissions')
      .select('*, subjects(name, semesters(number, branches(name)))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSubmissions(data || [])
        setLoading(false)
      })
  }, [session, authLoading, navigate])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  const counts = {
    total: submissions.length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto animate-fadeIn">
        {/* Profile Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile?.username || 'User'}</h1>
                <p className="text-sm text-gray-400">
                  Joined {new Date(profile?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/') }}
              className="px-4 py-2 text-sm font-medium text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total',        value: counts.total,    color: 'bg-blue-50 text-blue-600' },
            { label: 'Submitted',    value: counts.approved, color: 'bg-green-50 text-green-600' },
            { label: 'Under Review', value: counts.pending,  color: 'bg-orange-50 text-orange-600' },
            { label: 'Rejected',     value: counts.rejected, color: 'bg-red-50 text-red-600' },
          ].map((s) => (
            <div key={s.label} className={`p-4 rounded-xl text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs mt-0.5 opacity-75">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Submissions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Submissions</h2>

          {submissions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white border border-gray-100 rounded-2xl">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium">No submissions yet</p>
              <p className="text-sm mt-1">
                <a href="/submit" className="text-blue-500 hover:underline">Submit your first resource</a>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => {
                const cfg = statusConfig[s.status] || statusConfig.pending
                const branch = s.subjects?.semesters?.branches?.name
                const sem = s.subjects?.semesters?.number
                const subj = s.subjects?.name

                return (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg}`}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {s.type === 'notes' ? 'Notes' : 'PYQ'}
                          {subj && ` · ${subj}`}
                          {branch && ` · ${branch}`}
                          {sem && ` · Sem ${sem}`}
                          {' · '}{new Date(s.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={s.gdrive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                    >
                      View ↗
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
