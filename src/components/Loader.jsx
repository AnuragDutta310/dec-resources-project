import { useState, useEffect } from 'react'

export default function Loader() {
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1600)
    const t2 = setTimeout(() => setGone(true), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo with subtle ping ring */}
        <div className="relative flex items-center justify-center">
          <span className="absolute w-36 h-36 rounded-full bg-blue-100 animate-ping opacity-20" />
          <img
            src="/logo.png"
            alt="Dhemaji Engineering College"
            className="relative w-28 h-28 object-contain drop-shadow-sm"
          />
        </div>

        {/* College name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
            Dhemaji Engineering College
          </h1>
          <p className="text-sm text-gray-400 mt-1 tracking-wide uppercase font-medium">
            Student Resource Portal
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
