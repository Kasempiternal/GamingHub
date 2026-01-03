'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { games, type Game } from '@/lib/games';

// Animated background with floating particles
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)',
          top: '20%',
          right: '-15%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
          bottom: '-5%',
          left: '30%',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Game card with theme-specific styling
function GameCard({ game, index }: { game: Game; index: number }) {
  const accentColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    sky: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      text: 'text-sky-400',
      glow: 'shadow-sky-500/20',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      glow: 'shadow-red-500/20',
    },
    circus: {
      bg: 'bg-amber-600/10',
      border: 'border-amber-600/30',
      text: 'text-amber-500',
      glow: 'shadow-amber-600/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      glow: 'shadow-purple-500/20',
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/20',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      glow: 'shadow-cyan-500/20',
    },
  };

  const colors = accentColors[game.accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
    >
      <Link href={game.href} className="block group">
        <motion.div
          className={`
            relative overflow-hidden rounded-2xl
            bg-slate-900/50 backdrop-blur-xl
            border ${colors.border}
            transition-all duration-500
            hover:shadow-2xl hover:${colors.glow}
          `}
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

          {/* Content */}
          <div className="relative p-6">
            {/* Header with icon and tagline */}
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center text-4xl border ${colors.border}`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {game.icon}
              </motion.div>
              <span className={`text-xs ${colors.text} uppercase tracking-wider font-medium px-2 py-1 ${colors.bg} rounded-full`}>
                {game.tagline}
              </span>
            </div>

            {/* Title and description */}
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              {game.name}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              {game.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-white/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span className="text-sm">{game.players}</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{game.duration}</span>
              </div>
              <div className="ml-auto">
                <motion.div
                  className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center`}
                  whileHover={{ x: 5 }}
                >
                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Feature card with icon animation
function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="text-center group"
    >
      <motion.div
        className="w-14 h-14 mx-auto mb-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center text-2xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          🎮
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-5 py-12 safe-area-top safe-area-bottom">
      <AnimatedBackground />

      {/* Header / Hero */}
      <motion.header
        className="relative z-10 text-center mb-12 pt-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Animated Logo */}
        <motion.div
          className="relative inline-block mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 mx-auto">
            <motion.span
              className="text-5xl"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🎮
            </motion.span>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl -z-10" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Gaming Hub
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-white/40 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Juegos multijugador para disfrutar con amigos.
          <br />
          <span className="text-white/30">Sin descargas, desde cualquier dispositivo.</span>
        </motion.p>

        {/* Version badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.05]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span
            className="w-2 h-2 bg-emerald-400 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-white/40 text-xs font-medium">v2.8.0 - Asesinato Edition</span>
        </motion.div>
      </motion.header>

      {/* Section Title */}
      <motion.div
        className="relative z-10 text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-white/20 text-xs uppercase tracking-[0.2em] font-medium">
          Selecciona un juego
        </span>
      </motion.div>

      {/* Games Grid - 2x2 on medium, 4 columns on large */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>

      {/* Features Section - Symmetric 3 columns */}
      <motion.section
        className="relative z-10 w-full max-w-2xl mx-auto mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="grid grid-cols-3 gap-8">
          <FeatureCard
            icon="📱"
            title="Movil primero"
            description="Diseñado para tu telefono"
            delay={0.9}
          />
          <FeatureCard
            icon="⚡"
            title="Tiempo real"
            description="Sincronización instantánea"
            delay={1.0}
          />
          <FeatureCard
            icon="🌐"
            title="Sin descargas"
            description="Directo desde el navegador"
            delay={1.1}
          />
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-white/15 text-xs">
          Hecho con cariño para noches de juegos 🎲
        </p>
      </motion.footer>
    </main>
  );
}
