'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useScout } from '@/hooks/useScout';
import { RulesModal, HelpButton } from '@/components/scout';
import { CircusBackground } from '@/components/themes';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { RoomShareSection } from '@/components/shared/RoomShareSection';

export default function ScoutHome() {
  const router = useRouter();
  const { createGame, joinGame, loading, error } = useScout();
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'created'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    const success = await createGame(playerName.trim());
    if (success) {
      const stored = sessionStorage.getItem('scoutRoomCode');
      if (stored) {
        setCreatedRoomCode(stored);
        setMode('created');
      }
    }
  };

  const handleContinueToRoom = () => {
    router.push(`/scout/sala/${createdRoomCode}`);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    const success = await joinGame(roomCode.trim().toUpperCase(), playerName.trim());
    if (success) {
      router.push(`/scout/sala/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <CircusBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="scout" />

      {/* Header with back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/" className="flex items-center gap-2 text-amber-400/70 hover:text-amber-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Salir</span>
        </Link>
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-amber-500/30 relative overflow-hidden"
        >
          {/* Circus tent watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-amber-400 text-6xl font-black">SCOUT</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-6">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-amber-500 rounded-full flex items-center justify-center shadow-2xl relative"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                  '0 0 40px rgba(251, 191, 36, 0.5)',
                  '0 0 20px rgba(251, 191, 36, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">🎪</span>
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400/50"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400/50"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent mb-1">
              SCOUT
            </h1>
            <p className="text-amber-300/60 text-sm">
              El Circo de las Cartas
            </p>
          </div>

          {/* Content */}
          {mode === 'menu' && (
            <div className="space-y-4 relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Show
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 font-medium flex items-center justify-center gap-2 hover:bg-amber-500/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
                Unirse al Circo
              </motion.button>

              {/* How to play */}
              <div className="mt-6 pt-5 border-t border-amber-500/20">
                <h3 className="text-amber-300/80 font-medium mb-4 text-center text-sm uppercase tracking-wider">Como Funciona</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '🃏', text: 'Cartas duales' },
                    { icon: '🎭', text: 'Show o Scout' },
                    { icon: '🏆', text: 'Captura puntos' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-amber-300/60 text-xs">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => setMode('menu')}
                className="flex items-center gap-1 text-amber-400/70 text-sm hover:text-amber-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-amber-300">Crear Show</h2>
                <p className="text-amber-400/50 text-xs">Abre las puertas del circo</p>
              </div>

              <div>
                <label className="block text-amber-300/70 text-sm mb-2 uppercase tracking-wider">Tu Nombre</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Director del circo..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:bg-amber-500/20 transition-all"
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
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Preparando...
                  </>
                ) : (
                  <>
                    <span>🎪</span>
                    Abrir Circo
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => setMode('menu')}
                className="flex items-center gap-1 text-amber-400/70 text-sm hover:text-amber-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-amber-300">Unirse al Circo</h2>
                <p className="text-amber-400/50 text-xs">Entra al espectaculo</p>
              </div>

              <div>
                <label className="block text-amber-300/70 text-sm mb-2 uppercase tracking-wider">Codigo del Show</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="★★★★"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-center text-2xl tracking-widest uppercase placeholder-amber-400/30 focus:outline-none focus:border-amber-400 focus:bg-amber-500/20 transition-all font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-amber-300/70 text-sm mb-2 uppercase tracking-wider">Tu Nombre</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:bg-amber-500/20 transition-all"
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
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Entrando...
                  </>
                ) : (
                  <>
                    <span>🎟️</span>
                    Entrar
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'created' && (
            <RoomShareSection
              roomCode={createdRoomCode}
              gameSlug="scout"
              accentColor="amber"
              playerName={playerName}
              onBack={() => setMode('menu')}
              onContinue={handleContinueToRoom}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Help button */}
      <HelpButton onClick={() => setShowRules(true)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
