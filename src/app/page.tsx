'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Game definitions - Apple-inspired colors (NO purple)
const games = [
  {
    id: 'codigo-secreto',
    name: 'Codigo Secreto',
    description: 'Juego de espias y palabras. Adivina las palabras de tu equipo usando pistas.',
    icon: '🕵️',
    gradient: 'from-rose-500 to-orange-400',
    bgLight: 'bg-rose-500/10',
    players: '4-20',
    duration: '15-30 min',
    href: '/codigo-secreto',
    available: true,
  },
  {
    id: 'impostor',
    name: 'Impostor',
    description: 'Encuentra al impostor. Todos tienen la misma palabra... excepto uno.',
    icon: '🎭',
    gradient: 'from-amber-500 to-red-500',
    bgLight: 'bg-amber-500/10',
    players: '3-12',
    duration: '10-20 min',
    href: '/impostor',
    available: true,
  },
  {
    id: 'the-mind',
    name: 'The Mind',
    description: 'Sincronizacion mental. Juega cartas en orden sin hablar.',
    icon: '🧠',
    gradient: 'from-sky-500 to-emerald-500',
    bgLight: 'bg-sky-500/10',
    players: '2-4',
    duration: '15-25 min',
    href: '/the-mind',
    available: true,
  },
];

// Subtle animated gradient background
function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Subtle animated orbs */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[100px]"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px]"
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// Game card component - Minimal Apple style
function GameCard({ game, index }: { game: typeof games[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
    >
      {game.available ? (
        <Link href={game.href} className="block group">
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-1">
            {/* Subtle gradient hover effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

            <div className="relative p-6">
              {/* Icon */}
              <div className={`w-14 h-14 ${game.bgLight} rounded-2xl flex items-center justify-center text-3xl mb-5 transition-transform duration-500 group-hover:scale-110`}>
                {game.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                {game.name}
              </h3>
              <p className="text-[15px] text-white/50 leading-relaxed mb-5">
                {game.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-[13px] text-white/30">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{game.duration}</span>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.03]">
          <div className="p-6">
            <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center text-3xl mb-5 opacity-40">
              {game.icon}
            </div>
            <h3 className="text-xl font-semibold text-white/30 mb-2">{game.name}</h3>
            <p className="text-[15px] text-white/20 mb-4">{game.description}</p>
            <span className="inline-block px-3 py-1 bg-white/[0.03] rounded-full text-[13px] text-white/30">
              Proximamente
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Feature item
function Feature({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="w-12 h-12 mx-auto mb-3 bg-white/[0.03] rounded-xl flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="text-[15px] font-medium text-white mb-1">{title}</h3>
      <p className="text-[13px] text-white/40">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-12 safe-area-top safe-area-bottom">
      <GradientBackground />

      {/* Hero Section */}
      <motion.div
        className="relative z-10 text-center mb-16 pt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-[22px] mb-8 shadow-2xl border border-white/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-4xl">🎮</span>
        </motion.div>

        <h1 className="text-[42px] sm:text-5xl font-bold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Gaming Hub
          </span>
        </h1>

        <p className="text-white/40 text-lg max-w-sm mx-auto leading-relaxed">
          Juegos multijugador para disfrutar con amigos. Sin descargas, desde cualquier dispositivo.
        </p>

        {/* Version badge */}
        <motion.div
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.05]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <span className="text-white/40 text-[13px] font-medium">v2.0.0</span>
        </motion.div>
      </motion.div>

      {/* Games Grid */}
      <div className="relative z-10 w-full max-w-3xl mb-20">
        <motion.div
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-white/20 text-[13px] uppercase tracking-wider font-medium">
            Juegos disponibles
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="grid grid-cols-3 gap-8">
          <Feature
            icon="📱"
            title="Movil primero"
            description="Optimizado para tu telefono"
            delay={0.8}
          />
          <Feature
            icon="⚡"
            title="Tiempo real"
            description="Sincronizacion instantanea"
            delay={0.9}
          />
          <Feature
            icon="🌐"
            title="Sin descargas"
            description="Juega desde el navegador"
            delay={1.0}
          />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-auto pt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <p className="text-white/20 text-[13px]">
          Hecho con cuidado para noches de juegos
        </p>
      </motion.footer>
    </main>
  );
}
