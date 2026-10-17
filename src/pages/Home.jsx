import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Upload,
  ArrowRight,
  Sparkles,
  GraduationCap,
  FileText,
  Layers,
  ShieldCheck,
  Search,
  Cpu,
  Building2,
  Wrench,
  Download,
  Users,
  CheckCircle2,
  ExternalLink,
  Globe,
  Heart,
  ChevronRight,
  Flame
} from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const canvasRef = useRef(null);

  // Canvas Particle Animation with Bigger, Visible Particles
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

    // Particle Configuration (Bigger size & visibility)
    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 2, // Larger particles (2px to 4.5px)
        color: Math.random() > 0.5 ? 'rgba(16, 185, 129, ' : 'rgba(245, 158, 11, ' // Emerald & Amber
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.25 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '0.75)'; // High opacity for clear visibility
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color + '1)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
  };

  const branches = [
    {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      icon: Cpu,
      accent: 'from-emerald-500/25 via-teal-500/10 to-transparent border-emerald-500/35 text-emerald-400',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      count: '420+ Resources',
      desc: 'Data Structures, OS, DBMS, AI/ML, Networks & ASTU PYQs.'
    },
    {
      name: 'Civil Engineering',
      code: 'CE',
      icon: Building2,
      accent: 'from-blue-600/25 via-cyan-500/10 to-transparent border-blue-500/35 text-blue-400',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      count: '310+ Resources',
      desc: 'Structural Analysis, Surveying, Geotech, Fluid Mechanics & Drawings.'
    },
    {
      name: 'Mechanical Engineering',
      code: 'ME',
      icon: Wrench,
      accent: 'from-amber-500/25 via-orange-500/10 to-transparent border-amber-500/35 text-amber-400',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      count: '280+ Resources',
      desc: 'Thermodynamics, CAD/CAM, Fluid Power, Kinematics & Lab Manuals.'
    }
  ];

  const features = [
    {
      icon: FileText,
      title: 'Previous Year Papers',
      desc: 'Solved & unsolved ASTU end-semester question papers spanning the last 5 years.'
    },
    {
      icon: BookOpen,
      title: 'Handwritten & Typed Notes',
      desc: 'Top-scoring lecture summaries, unit-wise digests, and formula sheets.'
    },
    {
      icon: ShieldCheck,
      title: 'Moderated & Verified',
      desc: 'Peer-reviewed content tagged by module, year, and subject code for zero clutter.'
    },
    {
      icon: Layers,
      title: 'Lab Manuals & Code',
      desc: 'Ready-to-reference practical code experiments, diagrams, and observation sets.'
    }
  ];

  const quickTags = ['Data Structures', 'Thermodynamics', 'Surveying', 'ASTU PYQs', 'Engg Mathematics', 'DBMS'];

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden flex flex-col justify-between">
      {/* Interactive Particle Network Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      {/* Ambient Educational Glows */}
      <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] bg-emerald-600/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-40 w-[34rem] h-[34rem] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full blur-[170px] pointer-events-none z-0" />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Main Content Container */}
      <div className="relative z-10">
        <main className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            {/* College Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium mb-6 shadow-xl shadow-emerald-950/40 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>A student-led initiative from DEC</span>
            </motion.div>

            {/* Hero Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.12] mb-6"
            >
              Smart Academic Vault for{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                DEC Engineers
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed font-light"
            >
              Access verified lecture notes, previous year question papers, and lab manuals organized by branch and semester—curated by students, for students.
            </motion.p>

            {/* Hero CTA Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/browse"
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 transition-all group cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>Explore Materials</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/submit"
                  className="w-full px-8 py-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200 font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-black/40"
                >
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span>Contribute Notes</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-5xl mx-auto mt-16 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80"
          >
            {[
              { label: 'Study Material', value: 'Notes & PYQs', icon: Download },
              { label: 'Engineering Branches', value: '3 Disciplines', icon: Layers },
              { label: 'ASTU Semesters', value: '1 to 8', icon: GraduationCap },
              { label: 'Peer Collaboration', value: 'Community Driven', icon: Users }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 group hover:bg-slate-800/30 rounded-xl transition-all">
                <stat.icon className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Core Branches Section */}
          <section className="mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Department Streams</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Explore By Branch</h2>
              </div>
              <Link
                to="/browse"
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-3 md:mt-0 transition-colors"
              >
                View all branches <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((branch, i) => (
                <motion.div
                  key={branch.code}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="relative group p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${branch.accent} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity pointer-events-none`} />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-slate-800/90 text-emerald-400 group-hover:scale-105 transition-transform shadow-md">
                        <branch.icon className="w-6 h-6" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {branch.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Semesters 1 - 8</span>
                    <Link
                      to={`/browse?branch=${branch.code.toLowerCase()}`}
                      className="text-xs font-semibold text-emerald-400 group-hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Open Branch <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Features Highlights Grid */}
          <section className="mt-28">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Engineered for Success</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Everything You Need for Semester Exams
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                No more chasing PDFs on WhatsApp groups hours before tests.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/70 hover:border-emerald-500/30 transition-all hover:bg-slate-900/80 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contribution Callout Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-28 relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl"
          >
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" /> Student-powered platform
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Have Great Notes or PYQs? Share With Your Batchmates.
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed font-light">
                Help build Dhemaji Engineering College’s most comprehensive knowledge bank. Upload your notes in PDF format and earn recognition in the student directory.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/submit"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Notes Now
                </Link>
                <a
                  href="https://astu.ac.in/?page_id=38068"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  ASTU Syllabus Portal
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modern Footer */}
      <footer className="relative border-t border-slate-800/80 bg-[#040810] backdrop-blur-md mt-20 pt-12 pb-8 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-8 border-b border-slate-800/60">

            {/* Brand Info */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-600/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">DEC Vault</span>
              </div>
              <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed">
                Centralized academic resource sharing platform built by students of DEC.<br></br>
                Developed by: Anurag Dutta and Fiden Ahmed
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Repository</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse" className="text-slate-400 hover:text-emerald-400 transition-colors">Lecture Notes & Papers</Link></li>
                <li><Link to="/submit" className="text-slate-400 hover:text-emerald-400 transition-colors">Submit Notes</Link></li>
              </ul>
            </div>

            {/* Important Links */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Important Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://astu.ac.in" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">ASTU Official <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
                <li><a href="https://dec.ac.in" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">DEC Official <ExternalLink className="w-3 h-3 text-slate-500" /></a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} DEC Vault. Built by students, for students.</p>
            <p className="flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> for DEC</p>
          </div>
        </div>
      </footer>
    </div>
  );
}