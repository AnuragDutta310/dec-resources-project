import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

const branchIcons = {
  'Computer Science Engineering': '💻',
  'Civil Engineering': '🏗️',
  'Mechanical Engineering': '⚙️',
}

export default function Browse() {
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
      // Get the semester UUID first
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
          <button onClick={reset} className="hover:text-blue-600 font-medium text-gray-600">
            Browse
          </button>
          {selectedBranch && (
            <>
              <span>›</span>
              <button
                onClick={() => { setSelectedSemNum(null); setSelectedSubject(null); setMaterials([]) }}
                className="hover:text-blue-600"
              >
                {selectedBranch.code}
              </button>
            </>
          )}
          {selectedSemNum && (
            <>
              <span>›</span>
              <button
                onClick={() => { setSelectedSubject(null); setMaterials([]) }}
                className="hover:text-blue-600"
              >
                Semester {selectedSemNum}
              </button>
            </>
          )}
          {selectedSubject && (
            <>
              <span>›</span>
              <span className="text-gray-700">{selectedSubject.name}</span>
            </>
          )}
        </div>

        {/* ── Step 1: Branch ── */}
        {!selectedBranch && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Select Branch</h2>
            <p className="text-sm text-gray-400 mb-6">Choose your engineering branch to get started</p>
            {loadingBranches ? (
              <div className="grid sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranch(b)}
                    className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group"
                  >
                    <div className="text-3xl mb-3">{branchIcons[b.name] || '📖'}</div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                      {b.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{b.code}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Semester ── */}
        {selectedBranch && !selectedSemNum && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Select Semester</h2>
            <p className="text-sm text-gray-400 mb-6">{selectedBranch.name}</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedSemNum(n)}
                  className="aspect-square flex items-center justify-center bg-white border border-gray-100 rounded-xl font-bold text-gray-700 text-lg shadow-sm hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Subject ── */}
        {selectedBranch && selectedSemNum && !selectedSubject && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Select Subject</h2>
            <p className="text-sm text-gray-400 mb-6">
              {selectedBranch.name} · Semester {selectedSemNum}
            </p>
            {loadingSubjects ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-medium">No subjects added yet</p>
                <p className="text-sm mt-1">Ask the admin to add subjects for this semester.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s)}
                    className="w-full p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {s.name}
                      </p>
                      {s.code && <p className="text-xs text-gray-400 mt-0.5">{s.code}</p>}
                    </div>
                    <span className="text-gray-300 group-hover:text-blue-400 text-lg">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Materials ── */}
        {selectedSubject && (
          <div className="animate-fadeIn">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedSubject.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {selectedBranch.name} · Semester {selectedSemNum}
                </p>
              </div>
              {/* Filter pills */}
              <div className="flex gap-2">
                {[
                  { v: 'all', l: 'All' },
                  { v: 'notes', l: 'Notes' },
                  { v: 'pyq', l: 'PYQs' },
                ].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setFilter(f.v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f.v
                        ? 'bg-blue-700 text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
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
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-medium">No materials yet</p>
                <p className="text-sm mt-1">
                  Be the first to{' '}
                  <a href="/submit" className="text-blue-500 hover:underline">
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
                    className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center gap-4 justify-between flex-wrap"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${
                          m.type === 'notes'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {m.type === 'notes' ? 'Notes' : 'PYQ'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{m.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          by {m.submitted_by} ·{' '}
                          {new Date(m.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={m.gdrive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
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
