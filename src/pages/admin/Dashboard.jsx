import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// ──────────────────────────────────────────────
//  Shared helpers
// ──────────────────────────────────────────────

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

const inputCls =
  'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

// ──────────────────────────────────────────────
//  Admin Dashboard (root)
// ──────────────────────────────────────────────

const NAV = [
  { id: 'overview',     icon: '📊', label: 'Overview' },
  { id: 'pending',      icon: '⏳', label: 'Pending' },
  { id: 'submissions',  icon: '📋', label: 'All Submissions' },
  { id: 'manage',       icon: '⚙️', label: 'Manage Data' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [submissions, setSubmissions] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(true)
  const navigate = useNavigate()

  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('submissions').select('status')
    if (data) {
      const count = (s) => data.filter((d) => d.status === s).length
      setStats({ pending: count('pending'), approved: count('approved'), rejected: count('rejected'), total: data.length })
    }
  }, [])

  const [editedSubjects, setEditedSubjects] = useState({})

  const fetchSubs = useCallback(async () => {
    setLoadingSubs(true)
    const { data } = await supabase
      .from('submissions')
      .select(`*, subjects(id, name, is_approved, semesters(number, branches(name)))`)
      .order('created_at', { ascending: false })
    setSubmissions(data || [])
    setLoadingSubs(false)
  }, [])

  useEffect(() => {
    fetchStats()
    fetchSubs()
  }, [fetchStats, fetchSubs])

  const approveSubmission = async (sub) => {
    const updatedName = editedSubjects[sub.id]?.trim()
    if (sub.subject_id) {
      const updateData = { is_approved: true }
      if (updatedName && updatedName !== sub.subjects?.name) {
        updateData.name = updatedName
      }
      await supabase.from('subjects').update(updateData).eq('id', sub.subject_id)
    }
    await supabase.from('submissions').update({ status: 'approved' }).eq('id', sub.id)
    await Promise.all([fetchStats(), fetchSubs()])
  }

  const updateStatus = async (id, status) => {
    await supabase.from('submissions').update({ status }).eq('id', id)
    await Promise.all([fetchStats(), fetchSubs()])
  }

  const deleteSubmission = async (id) => {
    if (!window.confirm('Permanently delete this submission? This cannot be undone.')) return
    await supabase.from('submissions').delete().eq('id', id)
    await Promise.all([fetchStats(), fetchSubs()])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const pending = submissions.filter((s) => s.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 fixed h-full z-30">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <img src="/logo.png" alt="DEC" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-bold text-xs text-blue-900 leading-tight">Admin Panel</p>
            <p className="text-xs text-gray-400">DEC Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === n.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-base">{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'pending' && stats.pending > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DEC" className="h-8 w-8 object-contain" />
            <span className="font-bold text-sm text-blue-900">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-red-500 font-semibold">
            Logout
          </button>
        </div>
        <div className="flex overflow-x-auto border-t border-gray-100 scrollbar-none">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex-shrink-0 flex items-center gap-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                tab === n.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'
              }`}
            >
              {n.icon} {n.label}
              {n.id === 'pending' && stats.pending > 0 && (
                <span className="bg-orange-100 text-orange-600 font-bold px-1.5 rounded-full ml-1">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-56 pt-24 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
          {tab === 'overview' && (
            <OverviewTab stats={stats} setTab={setTab} />
          )}
          {tab === 'pending' && (
            <SubsTab
              title="Pending Review"
              rows={pending}
              loading={loadingSubs}
              onApprove={approveSubmission}
              onUpdate={updateStatus}
              onDelete={deleteSubmission}
              editedSubjects={editedSubjects}
              setEditedSubjects={setEditedSubjects}
            />
          )}
          {tab === 'submissions' && (
            <SubsTab
              title="All Submissions"
              rows={submissions}
              loading={loadingSubs}
              onApprove={approveSubmission}
              onUpdate={updateStatus}
              onDelete={deleteSubmission}
              editedSubjects={editedSubjects}
              setEditedSubjects={setEditedSubjects}
            />
          )}
          {tab === 'manage' && <ManageTab />}
        </div>
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Overview Tab
// ──────────────────────────────────────────────

function OverviewTab({ stats, setTab }) {
  const cards = [
    { label: 'Pending Review', value: stats.pending, color: 'bg-orange-50 text-orange-600 border-orange-100', tab: 'pending' },
    { label: 'Approved',        value: stats.approved, color: 'bg-green-50 text-green-600 border-green-100',  tab: 'submissions' },
    { label: 'Rejected',        value: stats.rejected, color: 'bg-red-50 text-red-600 border-red-100',        tab: 'submissions' },
    { label: 'Total',           value: stats.total,    color: 'bg-blue-50 text-blue-600 border-blue-100',     tab: 'submissions' },
  ]

  return (
    <div className="animate-fadeIn">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => setTab(c.tab)}
            className={`p-5 rounded-2xl border text-left hover:shadow-md transition-shadow ${c.color}`}
          >
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1 opacity-75">{c.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Submissions Tab (pending + all)
// ──────────────────────────────────────────────

const statusColor = {
  pending:  'bg-orange-50 text-orange-600',
  approved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
}

function SubsTab({ title, rows, loading, onApprove, onUpdate, onDelete, editedSubjects, setEditedSubjects }) {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        {title}{' '}
        <span className="text-gray-400 font-normal text-base">({rows.length})</span>
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>Nothing here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((s) => {
            const branch = s.subjects?.semesters?.branches?.name
            const sem    = s.subjects?.semesters?.number
            const subj   = s.subjects?.name
            const isSubjectPending = !s.subjects?.is_approved

            return (
              <div
                key={s.id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start justify-between gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${
                      s.type === 'notes' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {s.type === 'notes' ? 'Notes' : 'PYQ'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusColor[s.status]}`}>
                      {s.status}
                    </span>
                    {isSubjectPending && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        ⚡ NEW SUBJECT
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{s.title}</p>

                  {/* Subject Name with edit capability for Admin before approval */}
                  <div className="my-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500">Subject:</span>
                    <input
                      type="text"
                      value={editedSubjects[s.id] ?? subj ?? ''}
                      onChange={(e) => setEditedSubjects(prev => ({ ...prev, [s.id]: e.target.value }))}
                      className="text-xs font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 min-w-[140px]"
                      placeholder="Subject name"
                    />
                    <span className="text-[10px] text-gray-400">
                      (editable before approving)
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-0.5">
                    by <strong>{s.submitted_by}</strong>
                    {branch && ` · ${branch}`}
                    {sem && ` · Sem ${sem}`}
                    {' · '}{new Date(s.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <a
                    href={s.gdrive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                  >
                    View ↗
                  </a>
                  {s.status !== 'approved' && (
                    <button
                      onClick={() => onApprove(s)}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {s.status !== 'rejected' && (
                    <button
                      onClick={() => onUpdate(s.id, 'rejected')}
                      className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                    >
                      Reject
                    </button>
                  )}
                  {s.status !== 'pending' && (
                    <button
                      onClick={() => onUpdate(s.id, 'pending')}
                      className="px-3 py-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-medium transition-colors"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


// ──────────────────────────────────────────────
//  Manage Tab
// ──────────────────────────────────────────────

function ManageTab() {
  const [view, setView] = useState('branches')

  return (
    <div className="animate-fadeIn">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Manage Data</h1>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'branches', label: 'Branches' },
          { id: 'subjects', label: 'Subjects' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              view === t.id
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === 'branches' && <BranchManager />}
      {view === 'subjects' && <SubjectManager />}
    </div>
  )
}

// ──────────────────────────────────────────────
//  Branch Manager
// ──────────────────────────────────────────────

function BranchManager() {
  const [branches, setBranches] = useState([])
  const [form, setForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('branches').select('*').order('name').then(({ data }) => setBranches(data || []))
  }, [])

  const add = async () => {
    if (!form.name.trim() || !form.code.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('branches')
      .insert({ name: form.name.trim(), code: form.code.trim().toUpperCase() })
      .select()

    if (data?.[0]) {
      // Auto-create 8 semesters
      await supabase.from('semesters').insert(
        [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ branch_id: data[0].id, number: n }))
      )
      setBranches((prev) => [...prev, data[0]])
      setForm({ name: '', code: '' })
    }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this branch? All its semesters, subjects, and submissions will be permanently deleted.')) return
    await supabase.from('branches').delete().eq('id', id)
    setBranches((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="font-semibold text-gray-900 mb-4">Add New Branch</p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Branch name e.g. Electronics Engineering"
            className={`${inputCls} flex-1 min-w-48`}
          />
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Code e.g. ECE"
            className={`${inputCls} w-28`}
          />
          <button
            onClick={add}
            disabled={saving || !form.name.trim() || !form.code.trim()}
            className="px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Adding…' : '+ Add'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          8 semesters are automatically created for each new branch.
        </p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{b.name}</p>
              <p className="text-xs text-gray-400">{b.code}</p>
            </div>
            <button
              onClick={() => remove(b.id)}
              className="px-3 py-1.5 text-xs text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
//  Subject Manager
// ──────────────────────────────────────────────

function SubjectManager() {
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selBranch, setSelBranch] = useState('')
  const [selSem, setSelSem] = useState('')
  const [form, setForm] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('branches').select('*').order('name').then(({ data }) => setBranches(data || []))
  }, [])

  useEffect(() => {
    if (!selBranch) { setSemesters([]); return }
    supabase.from('semesters').select('*').eq('branch_id', selBranch).order('number').then(({ data }) => setSemesters(data || []))
    setSelSem('')
    setSubjects([])
  }, [selBranch])

  useEffect(() => {
    if (!selSem) { setSubjects([]); return }
    setLoading(true)
    supabase.from('subjects').select('*').eq('semester_id', selSem).order('name').then(({ data }) => {
      setSubjects(data || [])
      setLoading(false)
    })
  }, [selSem])

  const add = async () => {
    if (!form.name.trim() || !selSem) return
    setSaving(true)
    const { data } = await supabase
      .from('subjects')
      .insert({ name: form.name.trim(), code: form.code.trim() || null, semester_id: selSem, is_approved: true })
      .select()
    if (data?.[0]) {
      setSubjects((prev) => [...prev, data[0]])
      setForm({ name: '', code: '' })
    }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this subject? All its submissions will also be deleted.')) return
    await supabase.from('subjects').delete().eq('id', id)
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <p className="font-semibold text-gray-900 mb-4">Manage Subjects</p>

        {/* Branch + Semester selectors */}
        <div className="flex gap-3 flex-wrap mb-4">
          <select
            value={selBranch}
            onChange={(e) => setSelBranch(e.target.value)}
            className={`${inputCls} flex-1 min-w-36`}
          >
            <option value="">Select Branch</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select
            value={selSem}
            onChange={(e) => setSelSem(e.target.value)}
            disabled={!selBranch}
            className={`${inputCls} w-36 disabled:opacity-40`}
          >
            <option value="">Select Sem</option>
            {semesters.map((s) => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
          </select>
        </div>

        {/* Add subject form */}
        {selSem && (
          <div className="flex gap-3 flex-wrap pt-4 border-t border-gray-100">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Subject name"
              className={`${inputCls} flex-1 min-w-36`}
            />
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="Code (optional)"
              className={`${inputCls} w-32`}
            />
            <button
              onClick={add}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Adding…' : '+ Add Subject'}
            </button>
          </div>
        )}
      </div>

      {/* Subject list */}
      {selSem && (
        loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No subjects yet for this semester. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  {s.code && <p className="text-xs text-gray-400">{s.code}</p>}
                </div>
                <button
                  onClick={() => remove(s.id)}
                  className="px-3 py-1.5 text-xs text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
