import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`} />
}

const branchIcons = {
  'Computer Science Engineering': '💻',
  'Civil Engineering': '🏗️',
  'Mechanical Engineering': '⚙️',
}

export default function Browse() {
  const canvasRef = useRef(null)

  const [branches, setBranches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [materials, setMaterials] = useState([])

  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedSemNum, setSelectedSemNum] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [filter, setFilter] = useState('all')

  const [loadingBranches, setLoadingBranches] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingMaterials, setLoadingMaterials] = useState(false)

  // Canvas Particle Constellation Animation Effect (Matching Login/Signup)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 2,
      color: Math.random() > 0.3 ? '#10B981' : '#F59E0B',
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - dist / 130})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Fetch branches on mount
  useEffect(() => {
    supabase.from('branches').select('*').order('name').then(({ data }) => {
      setBranches(data || [])
      setLoadingBranches(false)
    })
  }, [])

  // Fetch subjects when branch + sem chosen
  useEffect(() => {
    if (!selectedBranch || !selectedSemNum) return
    setLoadingSubjects(true)
    setSubjects([])
    setSelectedSubject(null)
    setMaterials([])

    const load = async () => {
      const { data: sem } = await supabase
        .from('semesters')
        .select('id')
        .eq('branch_id', selectedBranch.id)
        .eq('number', selectedSemNum)
        .single()

      if (sem) {
        const { data } = await supabase
          .from('subjects')
          .select('*')
          .eq('semester_id', sem.id)
          .eq('is_approved', true)
          .order('name')
        setSubjects(data || [])
      }
      setLoadingSubjects(false)
    }
    load()
  }, [selectedBranch, selectedSemNum])

  // Fetch approved materials when subject chosen
  useEffect(() => {
    if (!selectedSubject) return
    setLoadingMaterials(true)
    setMaterials([])

    supabase
      .from('submissions')
      .select('*')
      .eq('subject_id', selectedSubject.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMaterials(data || [])
        setLoadingMaterials(false)
      })
  }, [selectedSubject])

  const reset = () => {
    setSelectedBranch(null)
    setSelectedSemNum(null)
    setSelectedSubject(null)
    setSubjects([])
    setMaterials([])
    setFilter('all')
  }

  const filteredMaterials =
    filter === 'all' ? materials : materials.filter((m) => m.type === filter)

  return (
    <main className="min-h-screen bg-[#060B14] text-slate-100 relative overflow-hidden">
      {/* Connected Particle Constellation Background Canvas (Fullscreen Fixed Size) */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40 w-full h-full" />

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 flex-wrap">
          <button onClick={reset} className="hover:text-emerald-400 font-medium text-slate-300 transition-colors">
            Browse
          </button>
          {selectedBranch && (
            <>
              <span className="text-slate-600">›</span>
              <button
                onClick={() => { setSelectedSemNum(null); setSelectedSubject(null); setMaterials([]) }}
                className="hover:text-emerald-400 transition-colors"
              >
                {selectedBranch.code}
              </button>
            </>
          )}
          {selectedSemNum && (
            <>
              <span className="text-slate-600">›</span>
              <button
                onClick={() => { setSelectedSubject(null); setMaterials([]) }}
                className="hover:text-emerald-400 transition-colors"
              >
                Semester {selectedSemNum}
              </button>
            </>
          )}
          {selectedSubject && (
            <>
              <span className="text-slate-600">›</span>
              <span className="text-slate-200 font-medium">{selectedSubject.name}</span>
            </>
          )}
        </div>

        {/* Step 1: Branch */}
        {!selectedBranch && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-white mb-1">Select Branch</h2>
            <p className="text-sm text-slate-400 mb-8">Choose your engineering branch to get started</p>
            {loadingBranches ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-5">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranch(b)}
                    className="p-6 bg-slate-900/70 border border-slate-800/80 rounded-3xl shadow-xl hover:shadow-2xl hover:border-emerald-500/40 hover:bg-slate-900 transition-all text-left group backdrop-blur-md"
                  >
                    <div className="text-3xl mb-3 p-3 w-fit rounded-2xl bg-slate-800/80">{branchIcons[b.name] || '📖'}</div>
                    <p className="font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug text-base">
                      {b.name}
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold mt-2">{b.code} Stream</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Semester */}
        {selectedBranch && !selectedSemNum && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-white mb-1">Select Semester</h2>
            <p className="text-sm text-slate-400 mb-8">{selectedBranch.name}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedSemNum(n)}
                  className="aspect-square flex flex-col items-center justify-center bg-slate-900/70 border border-slate-800/80 rounded-2xl font-bold text-slate-200 text-xl shadow-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all group backdrop-blur-md"
                >
                  <span>Sem {n}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Subject */}
        {selectedBranch && selectedSemNum && !selectedSubject && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-extrabold text-white mb-1">Select Subject</h2>
            <p className="text-sm text-slate-400 mb-8">
              {selectedBranch.name} · Semester {selectedSemNum}
            </p>
            {loadingSubjects ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-semibold text-slate-300">No subjects added yet</p>
                <p className="text-sm mt-1">Ask the admin to add subjects for this semester.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s)}
                    className="w-full p-5 bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-lg hover:shadow-xl hover:border-emerald-500/40 transition-all text-left flex items-center justify-between group backdrop-blur-md"
                  >
                    <div>
                      <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors text-base">
                        {s.name}
                      </p>
                      {s.code && <p className="text-xs text-emerald-400 font-mono mt-1">{s.code}</p>}
                    </div>
                    <span className="text-slate-600 group-hover:text-emerald-400 text-xl transition-colors">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Materials */}
        {selectedSubject && (
          <div className="animate-fadeIn">
            <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
              <div>
                <h2 className="text-2xl font-extrabold text-white">{selectedSubject.name}</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedBranch.name} · Semester {selectedSemNum}
                </p>
              </div>
              <div className="flex gap-2">
                {[
                  { v: 'all', l: 'All' },
                  { v: 'notes', l: 'Notes' },
                  { v: 'pyq', l: 'PYQs' },
                ].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setFilter(f.v)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      filter === f.v
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            {loadingMaterials ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-semibold text-slate-300">No materials yet</p>
                <p className="text-sm mt-1">
                  Be the first to{' '}
                  <a href="/submit" className="text-emerald-400 hover:underline">
                    submit one
                  </a>
                  !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 bg-slate-900/70 border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4 justify-between flex-wrap backdrop-blur-md"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span
                        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          m.type === 'notes'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {m.type === 'notes' ? 'Notes' : 'PYQ'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate text-base">{m.title}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          by {m.submitted_by} ·{' '}
                          {new Date(m.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={m.gdrive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Open ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}