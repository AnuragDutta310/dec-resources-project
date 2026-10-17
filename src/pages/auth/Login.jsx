import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { GraduationCap, User, Lock, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  // Multi-color Connected Particle Animation (Emerald & Amber mix)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodes = [];
    for (let i = 0; i < 30; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 2,
        color: Math.random() > 0.4 ? 'rgba(16, 185, 129, ' : 'rgba(245, 158, 11, ' // Emerald & Amber mix
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Connecting Node Lines
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const uname = username.trim().toLowerCase()
    const fakeEmail = `${uname}@decportal.app`

    const { error: err } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password,
    })

    if (err) {
      setError('Invalid username or password.')
      setLoading(false)
    } else {
      navigate('/profile')
    }
  }

  return (
    <main className="min-h-screen bg-[#060B14] text-slate-100 relative overflow-hidden flex items-center justify-center px-4">
      {/* Canvas Multi-color Connected Particle Animation */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-95" />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[36rem] h-[36rem] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[36rem] h-[36rem] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Widescreen Form Container */}
      <div className="w-full max-w-xl animate-fadeIn relative z-10 my-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl backdrop-blur-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-400 mt-1">Log in to your DEC Portal account</p>
        </div>

        {/* Larger Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 rounded-3xl shadow-2xl p-8 sm:p-12 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  required
                  autoComplete="username"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-11 pr-4 py-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-11 pr-4 py-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-400 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Home</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}