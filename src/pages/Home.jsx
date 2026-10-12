import { Link } from 'react-router-dom'

const features = [
  { icon: '📚', title: 'Lecture Notes', desc: 'Well-organized notes submitted by students across all branches and semesters.' },
  { icon: '📝', title: 'Previous Year Questions', desc: 'PYQs to help you prepare effectively and know what to expect in exams.' },
  { icon: '🔍', title: 'Smart Filtering', desc: 'Filter by branch, semester, and subject to find exactly what you need.' },
  { icon: '🤝', title: 'Community Driven', desc: 'Materials submitted by your peers and verified by admins before going live.' },
]

const stats = [
  { value: '3', label: 'Engineering Branches' },
  { value: '8', label: 'Semesters Each' },
  { value: '2+', label: 'Resource Types' },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center animate-fadeIn">
          <img
            src="/logo.png"
            alt="DEC"
            className="w-24 h-24 object-contain mx-auto mb-6 drop-shadow-sm"
          />
          <h1 className="text-4xl font-bold text-blue-900 tracking-tight mb-2">
            Dhemaji Engineering College
          </h1>
          <p className="text-lg text-gray-500 mb-1">Student Resource Portal</p>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Access notes and previous year questions — submitted by your peers, reviewed by admins.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/browse"
              className="px-8 py-3 bg-blue-800 text-white rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-sm"
            >
              Browse Materials
            </Link>
            <Link
              to="/submit"
              className="px-8 py-3 border-2 border-blue-800 text-blue-800 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Submit Resources
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 py-10 px-4">
        <div className="max-w-xl mx-auto grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-700">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">What you'll find here</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-900 py-16 px-4 text-white text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-3">Have notes or PYQs to share?</h2>
          <p className="text-blue-300 text-sm mb-6">
            Upload your Google Drive link. Your name will be credited once an admin approves it.
          </p>
          <Link
            to="/submit"
            className="inline-block px-8 py-3 bg-white text-blue-900 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Submit Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Dhemaji Engineering College · Student Resource Portal ·{' '}
        <a href="/admin/login" className="hover:underline">Admin</a>
      </footer>
    </main>
  )
}
