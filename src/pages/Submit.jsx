import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Upload, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function Submit() {
  const { session, profile } = useAuth()
  const canvasRef = useRef(null)

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

  // Multi-color Connected Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = document.documentElement.clientWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = document.documentElement.clientWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = [];
    for (let i = 0; i < 35; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 2,
        color: Math.random() > 0.4 ? 'rgba(16, 185, 129, ' : 'rgba(245, 158, 11, '
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 160)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '0.8)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = n.color + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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

    if (subject === '__new__' || (!subject && subjects.length === 0)) {
      const trimmedName = customSubject.trim()
      if (!trimmedName) {
        setError('Please enter the subject name.')
        setLoading(false)
        return
      }

      const { data: existing } = await supabase
        .from('subjects')
        .select('id')
        .eq('semester_id', semester)
        .ilike('name', trimmedName)
        .maybeSingle()

      if (existing) {
        subjectId = existing.id
      } else {
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
      <main className="min-h-[calc(100vh-5rem)] bg-[#060B14] text-slate-100 relative flex items-center justify-center px-4 py-8 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-95" />
        <div className="absolute top-1/4 left-1/4 w-[36rem] h-[36rem] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none z-0" />
        
        <div className="max-w-md w-full bg-slate-900/85 border border-slate-800/90 rounded-3xl shadow-2xl p-8 text-center animate-fadeIn backdrop-blur-xl relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-xl">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Submitted Successfully!</h2>
          <p className="text-xs text-slate-400 mb-6 font-light">
            Your resource is under review. Once an admin approves it, it'll appear in the portal with your name as credit.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                setSuccess(false)
                setCustomSubject('')
                setForm({
                  branch: '', semester: '', subject: '', type: 'notes', title: '', gdriveLink: '',
                  submittedBy: profile?.username || '',
                })
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Submit Another
            </button>
            {session ? (
              <Link
                to="/profile"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                View Profile
              </Link>
            ) : (
              <Link
                to="/browse"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
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
    <main className="min-h-[calc(100vh-5rem)] bg-[#060B14] text-slate-100 relative flex flex-col items-center justify-center px-4 py-6 overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-95" />
      <div className="absolute top-1/4 left-1/4 w-[36rem] h-[36rem] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[36rem] h-[36rem] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Responsive Container */}
      <div className="max-w-5xl w-full mx-auto animate-fadeIn relative z-10 my-auto">
        
        {/* Header */}
        <div className="mb-3 text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Submit Resources</h1>
          <p className="text-[11px] text-slate-400">
            Share via Google Drive link. Credited after admin review.
          </p>
        </div>

        {/* Guest Warning */}
        {!session && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 mb-3 flex items-center gap-2 backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-[11px] text-amber-300">
              <strong>Not logged in:</strong> Progress won't be saved.{' '}
              <Link to="/login" className="font-bold underline hover:text-amber-200 ml-1">Log in</Link> or{' '}
              <Link to="/signup" className="font-bold underline hover:text-amber-200">Sign up</Link>
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Resource Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1">Resource Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'notes', l: '📚 Notes & Slides' },
                  { v: 'pyq', l: '📝 PYQ Papers' },
                ].map((t) => (
                  <button
                    key={t.v}
                    type="button"
                    onClick={() => set('type', t.v)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      form.type === t.v
                        ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 1: Branch & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Branch" required>
                <Select value={form.branch} onChange={(v) => set('branch', v)} disabled={false} placeholder="Select branch">
                  {branches.map((b) => <option key={b.id} value={b.id} className="bg-slate-950 text-slate-200">{b.name}</option>)}
                </Select>
              </Field>

              <Field label="Semester" required>
                <Select value={form.semester} onChange={(v) => set('semester', v)} disabled={!form.branch} placeholder="Select semester">
                  {semesters.map((s) => <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">Semester {s.number}</option>)}
                </Select>
              </Field>
            </div>

            {/* Row 2: Subject & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Subject" required>
                <Select
                  value={form.subject}
                  onChange={(v) => {
                    set('subject', v)
                    if (v !== '__new__') setCustomSubject('')
                  }}
                  disabled={!form.semester}
                  placeholder={subjects.length === 0 ? 'No subjects — create below' : 'Select subject'}
                >
                  {subjects.map((s) => <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">{s.name}</option>)}
                  <option value="__new__" className="bg-slate-950 text-emerald-400 font-semibold">➕ Create / Type New Subject</option>
                </Select>
              </Field>

              <Field label="Title" required>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Data Structures Unit 1 Notes"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Custom Subject Field */}
            {(form.subject === '__new__' || (form.semester && subjects.length === 0)) && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
                  Enter Subject Name * <span className="text-slate-500 font-normal normal-case">(reviewed by admin)</span>
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

            {/* Row 3: Google Drive Link & Contributor Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Google Drive Link" required hint='File must be "Anyone with link can view"'>
                <input
                  type="url"
                  value={form.gdriveLink}
                  onChange={(e) => set('gdriveLink', e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className={inputCls}
                />
              </Field>

              <Field label="Your Name" required hint={session ? 'Auto-filled from account' : 'Public credit name'}>
                <input
                  type="text"
                  value={form.submittedBy}
                  onChange={(e) => set('submittedBy', e.target.value)}
                  placeholder="Full name"
                  className={`${inputCls} ${session ? 'bg-slate-900/50 text-slate-400' : ''}`}
                  readOnly={!!session}
                />
              </Field>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

const inputCls =
  'w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all'

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-0.5">
        {label} {required && <span className="text-emerald-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[9px] text-slate-500 mt-0.5 ml-0.5 font-light">{hint}</p>}
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
      <option value="" className="bg-slate-950 text-slate-500">{placeholder}</option>
      {children}
    </select>
  )
}