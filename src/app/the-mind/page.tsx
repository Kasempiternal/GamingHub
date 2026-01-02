'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheMind } from '@/hooks/useTheMind';
import { RulesModal, HelpButton } from '@/components/the-mind';
import { TelepathyBackground } from '@/components/themes';
import { NavigationMenu } from '@/components/shared/NavigationMenu';

export default function TheMindHome() {
  const router = useRouter();
  const { createGame, joinGame, loading, error } = useTheMind();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    const success = await createGame(playerName.trim());
    if (success) {
      const stored = sessionStorage.getItem('theMindRoomCode');
      if (stored) {
        router.push(`/the-mind/sala/${stored}`);
      }
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    const success = await joinGame(roomCode.trim().toUpperCase(), playerName.trim());
    if (success) {
      router.push(`/the-mind/sala/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <TelepathyBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="the-mind" />

      {/* Header with back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/" className="flex items-center gap-2 text-sky-400/70 hover:text-sky-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Desconectar</span>
        </Link>
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-sky-500/30 relative overflow-hidden"
        >
          {/* Connection wave watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-sky-400 text-6xl font-black">∿ SYNC ∿</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-6">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl relative"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(14, 165, 233, 0.3)',
                  '0 0 40px rgba(14, 165, 233, 0.5)',
                  '0 0 20px rgba(14, 165, 233, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">🧠</span>
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-sky-400/50"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-1">
              The Mind
            </h1>
            <p className="text-sky-300/60 text-sm">
              Conexion telepática
            </p>
          </div>

          {/* Content */}
          {mode === 'menu' && (
            <div className="space-y-4 relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Iniciar Conexion
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-300 font-medium flex items-center justify-center gap-2 hover:bg-sky-500/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Sincronizar
              </motion.button>

              {/* How to sync */}
              <div className="mt-6 pt-5 border-t border-sky-500/20">
                <h3 className="text-sky-300/80 font-medium mb-4 text-center text-sm uppercase tracking-wider">Protocolo Mental</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '🃏', text: 'Recibe cartas' },
                    { icon: '∿', text: 'Sincroniza' },
                    { icon: '↗', text: 'Juega en orden' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-sky-300/60 text-xs">{item.text}</div>
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
                className="flex items-center gap-1 text-sky-400/70 text-sm hover:text-sky-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-sky-300">Iniciar Conexion</h2>
                <p className="text-sky-400/50 text-xs">Crea un enlace mental</p>
              </div>

              <div>
                <label className="block text-sky-300/70 text-sm mb-2 uppercase tracking-wider">Identidad Mental</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-white placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:bg-sky-500/20 transition-all"
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
                className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Estableciendo...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Establecer Enlace
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => setMode('menu')}
                className="flex items-center gap-1 text-sky-400/70 text-sm hover:text-sky-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-sky-300">Sincronizar</h2>
                <p className="text-sky-400/50 text-xs">Conecta con otra mente</p>
              </div>

              <div>
                <label className="block text-sky-300/70 text-sm mb-2 uppercase tracking-wider">Frecuencia Mental</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="∿∿∿∿"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-300 text-center text-2xl tracking-widest uppercase placeholder-sky-400/30 focus:outline-none focus:border-sky-400 focus:bg-sky-500/20 transition-all font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sky-300/70 text-sm mb-2 uppercase tracking-wider">Identidad Mental</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-white placeholder-sky-400/40 focus:outline-none focus:border-sky-400 focus:bg-sky-500/20 transition-all"
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
                className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    Conectar
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Help button */}
      <HelpButton onClick={() => setShowRules(true)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
