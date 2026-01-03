'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useHipster } from '@/hooks/useHipster';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { RoomShareSection } from '@/components/shared/RoomShareSection';

// Music-themed animated background
function MusicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#1A0A24]">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(156,39,176,0.15) 0%, transparent 70%)',
          top: '-20%',
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
          background: 'radial-gradient(circle, rgba(233,30,99,0.12) 0%, transparent 70%)',
          top: '30%',
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
          background: 'radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)',
          bottom: '-5%',
          left: '40%',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating music notes */}
      {['🎵', '🎶', '🎤', '🎧', '🎸'].map((note, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-10"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
        >
          {note}
        </motion.div>
      ))}

      {/* Subtle grid */}
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
    </div>
  );
}

export default function HipsterHome() {
  const router = useRouter();
  const { createGame, joinGame, loading, error } = useHipster();
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'created'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    const success = await createGame(playerName.trim());
    if (success) {
      const stored = sessionStorage.getItem('hipsterRoomCode');
      if (stored) {
        setCreatedRoomCode(stored);
        setMode('created');
      }
    }
  };

  const handleContinueToRoom = () => {
    router.push(`/hipster/sala/${createdRoomCode}`);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    const success = await joinGame(roomCode.trim().toUpperCase(), playerName.trim());
    if (success) {
      router.push(`/hipster/sala/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <MusicBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="hipster" />

      {/* Header with back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/" className="flex items-center gap-2 text-purple-400/70 hover:text-purple-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Volver</span>
        </Link>
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-purple-500/30 relative overflow-hidden"
        >
          {/* Vinyl watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-purple-400 text-6xl font-black">♫ VINYL ♫</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-6">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl relative"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(156, 39, 176, 0.3)',
                  '0 0 40px rgba(156, 39, 176, 0.5)',
                  '0 0 20px rgba(156, 39, 176, 0.3)'
                ],
                rotate: [0, 360],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' }
              }}
            >
              <span className="text-4xl">🎵</span>
              {/* Vinyl grooves */}
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-4 rounded-full border border-white/10" />
            </motion.div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              Hipster
            </h1>
            <p className="text-purple-300/60 text-sm">
              Adivina la cancion
            </p>
          </div>

          {/* Content */}
          {mode === 'menu' && (
            <div className="space-y-4 relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Crear Partida
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 font-medium flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Unirse
              </motion.button>

              {/* How to play */}
              <div className="mt-6 pt-5 border-t border-purple-500/20">
                <h3 className="text-purple-300/80 font-medium mb-4 text-center text-sm uppercase tracking-wider">Como Jugar</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '🎧', text: 'Escucha' },
                    { icon: '📅', text: 'Ordena' },
                    { icon: '🏆', text: 'Gana' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-purple-300/60 text-xs">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Spotify note */}
              <div className="mt-4 text-center">
                <p className="text-purple-400/40 text-xs flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Requiere Spotify Premium (anfitrion)
                </p>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => setMode('menu')}
                className="flex items-center gap-1 text-purple-400/70 text-sm hover:text-purple-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-purple-300">Crear Partida</h2>
                <p className="text-purple-400/50 text-xs">Inicia una nueva sesion musical</p>
              </div>

              <div>
                <label className="block text-purple-300/70 text-sm mb-2 uppercase tracking-wider">Tu Nombre</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:bg-purple-500/20 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">{error}</div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={loading || !playerName.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Creando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Empezar
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => setMode('menu')}
                className="flex items-center gap-1 text-purple-400/70 text-sm hover:text-purple-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-purple-300">Unirse</h2>
                <p className="text-purple-400/50 text-xs">Entra a una partida existente</p>
              </div>

              <div>
                <label className="block text-purple-300/70 text-sm mb-2 uppercase tracking-wider">Codigo de Sala</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXX"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-center text-2xl tracking-widest uppercase placeholder-purple-400/30 focus:outline-none focus:border-purple-400 focus:bg-purple-500/20 transition-all font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-purple-300/70 text-sm mb-2 uppercase tracking-wider">Tu Nombre</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:bg-purple-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">{error}</div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={loading || !playerName.trim() || roomCode.length !== 4}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Unirse
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'created' && (
            <RoomShareSection
              roomCode={createdRoomCode}
              gameSlug="hipster"
              accentColor="purple"
              playerName={playerName}
              onBack={() => setMode('menu')}
              onContinue={handleContinueToRoom}
            />
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
