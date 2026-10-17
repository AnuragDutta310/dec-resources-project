import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, BookOpen, Upload, LogIn, UserPlus, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Scroll detection for smooth transparent effect while scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: BookOpen },
    { name: 'Explore', path: '/browse', icon: BookOpen },
    { name: 'Submit Notes', path: '/submit', icon: Upload },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-[#060B14]/75 backdrop-blur-xl border-slate-800/80 shadow-2xl'
          : 'bg-[#060B14] border-slate-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Subtitle */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/10">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">DEC Vault</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tracking-wider">
                Platform
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Dhemaji Engineering College</span>
          </div>
        </Link>

        {/* Center Navigation Capsule */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#0D1525] p-1.5 rounded-2xl border border-slate-800/90 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  active
                    ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white bg-[#0D1525] border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 shadow-md"
          >
            <LogIn className="w-4 h-4 text-emerald-400" />
            <span>Login</span>
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 hover:text-emerald-200 bg-[#0D1525] border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex items-center gap-2 shadow-md backdrop-blur-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Sign Up</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2.5 rounded-xl bg-[#0D1525] border border-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#060B14] px-6 pt-4 pb-6 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'text-slate-300 hover:bg-[#0D1525]'
                }`}
              >
                <Icon className="w-5 h-5 text-emerald-400" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-xl text-sm font-semibold text-slate-200 bg-[#0D1525] border border-slate-800 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-xl text-sm font-semibold text-emerald-300 bg-[#0D1525] border border-emerald-500/30 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}