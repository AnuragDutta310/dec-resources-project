import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Submit() {
  const { session, profile } = useAuth()

  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])

  const [form, setForm] = useState({
    branch: '',
    semester: '',
    subject: '',
    type: 'notes',
    title: '',
    gdriveLink: '',
    submittedBy: '',
  })

  const [customSubject, setCustomSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  // Auto-fill name from profile
  useEffect(() => {
    if (profile?.username) {
      setForm((f) => ({ ...f, submittedBy: profile.username }))
    }
  }, [profile])

  // Fetch branches
  useEffect(() => {
    supabase.from('branches').select('*').order('name').then(({ data }) => setBranches(data || []))
  }, [])

  // Fetch semesters when branch changes
  useEffect(() => {
    if (!form.branch) { setSemesters([]); return }
    supabase
      .from('semesters')
      .select('*')
      .eq('branch_id', form.branch)
      .order('number')
      .then(({ data }) => setSemesters(data || []))
    set('semester', '')
    set('subject', '')
    setSubjects([])
  }, [form.branch])

  // Fetch approved subjects when semester changes
  useEffect(() => {
    if (!form.semester) { setSubjects([]); return }
    supabase
      .from('subjects')
      .select('*')
      .eq('semester_id', form.semester)
      .eq('is_approved', true)
      .order('name')
      .then(({ data }) => setSubjects(data || []))
    set('subject', '')
    setCustomSubject('')
  }, [form.semester])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { branch, semester, subject, title, gdriveLink, submittedBy, type } = form

    if (!branch || !semester || !title || !gdriveLink || !submittedBy) {
      setError('Please fill in all required fields.')
      return
    }

    if (!gdriveLink.startsWith('https://')) {
      setError('Please enter a valid link starting with https://')
      return
    }

    setLoading(true)
    setError('')

    let subjectId = subject

    // Handle new/typed subject
    if (subject === '__new__' || (!subject && subjects.length === 0)) {
      const trimmedName = customSubject.trim()
      if (!trimmedName) {
        setError('Please enter the subject name.')
        setLoading(false)
        return
      }

      // Check if subject already exists for this semester
      const { data: existing } = await supabase
        .from('subjects')
        .select('id')
        .eq('semester_id', semester)
        .ilike('name', trimmedName)
        .maybeSingle()

      if (existing) {
        subjectId = existing.id
      } else {
        // Create subject with is_approved = false (pending admin review)
        const { data: created, error: createErr } = await supabase
          .from('subjects')
          .insert({
            name: trimmedName,
            semester_id: semester,
            is_approved: false,
          })
          .select('id')
          .single()

        if (createErr || !created) {
          setError(createErr?.message || 'Failed to submit subject. Please check permissions.')
          setLoading(false)
          return
        }
        subjectId = created.id
      }
    } else if (!subjectId) {
      setError('Please select a subject or create a new one.')
      setLoading(false)
      return
    }

    const payload = {
      subject_id: subjectId,
      type,
      title: title.trim(),
      gdrive_link: gdriveLink.trim(),
      submitted_by: submittedBy.trim(),
      status: 'pending',
    }

    // Link to user account if logged in
    if (session?.user?.id) {
      payload.user_id = session.user.id
    }

    const { error: err } = await supabase.from('submissions').insert(payload)

    if (err) {
      setError(err?.message || 'Submission failed. Please try again.')
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center animate-fadeIn">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submitted!</h2>
          <p className="text-sm text-gray-400 mb-6">
            Your resource is under review. Once an admin approves it, it'll appear in the portal with
            your name as credit.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                setSuccess(false)
                setManualSubject(false)
                setCustomSubject('')
                setForm({
                  branch: '', semester: '', subject: '', type: 'notes', title: '', gdriveLink: '',
                  submittedBy: profile?.username || '',
                })
              }}
              className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              Submit Another
            </button>
            {session ? (
              <Link
                to="/profile"
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                View Profile
              </Link>
            ) : (
              <Link
                to="/browse"
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Browse Materials
              </Link>
            )}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Submit Resources</h1>
          <p className="text-sm text-gray-400 mt-1">
            Share via a Google Drive link. You'll be credited after admin review.
          </p>
        </div>

        {/* Guest warning */}
        {!session && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-800">You're not logged in</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your submission won't be linked to any account. You won't be able to track its progress.{' '}
                <Link to="/login" className="font-semibold underline">Log in</Link> or{' '}
                <Link to="/signup" className="font-semibold underline">sign up</Link> to save your progress.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
            <div className="flex gap-3">
              {[
                { v: 'notes', l: '📚 Notes' },
                { v: 'pyq', l: '📝 Previous Year Questions' },
              ].map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => set('type', t.v)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.type === t.v
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          {/* Branch */}
          <Field label="Branch" required>
            <Select value={form.branch} onChange={(v) => set('branch', v)} disabled={false} placeholder="Select branch">
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>

          {/* Semester */}
          <Field label="Semester" required>
            <Select value={form.semester} onChange={(v) => set('semester', v)} disabled={!form.branch} placeholder="Select semester">
              {semesters.map((s) => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
            </Select>
          </Field>

          {/* Subject */}
          <Field label="Subject" required>
            <Select
              value={form.subject}
              onChange={(v) => {
                set('subject', v)
                if (v !== '__new__') setCustomSubject('')
              }}
              disabled={!form.semester}
              placeholder={subjects.length === 0 ? 'No existing subjects — create below' : 'Select subject'}
            >
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__new__">➕ Create / Type New Subject</option>
            </Select>

            {(form.subject === '__new__' || (form.semester && subjects.length === 0)) && (
              <div className="mt-2.5 animate-fadeIn">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Enter Subject Name * <span className="text-gray-400 font-normal">(reviewed by admin before going live)</span>
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g. Data Structures, Operating Systems, etc."
                  className={inputCls}
                  autoFocus={form.subject === '__new__'}
                />
              </div>
            )}
          </Field>

          {/* Title */}
          <Field label="Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Data Structures Unit 1 Notes"
              className={inputCls}
            />
          </Field>

          {/* GDrive link */}
          <Field label="Google Drive Link" required hint='Make sure the file is set to "Anyone with the link can view"'>
            <input
              type="url"
              value={form.gdriveLink}
              onChange={(e) => set('gdriveLink', e.target.value)}
              placeholder="https://drive.google.com/..."
              className={inputCls}
            />
          </Field>

          {/* Name */}
          <Field label="Your Name" required hint={session ? 'Auto-filled from your account' : 'This will appear as credit once approved'}>
            <input
              type="text"
              value={form.submittedBy}
              onChange={(e) => set('submittedBy', e.target.value)}
              placeholder="Full name"
              className={`${inputCls} ${session ? 'bg-gray-50' : ''}`}
              readOnly={!!session}
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting…' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </main>
  )
}

// ── Helpers ──

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Select({ value, onChange, disabled, placeholder, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  )
}
