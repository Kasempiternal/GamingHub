'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheMind } from '@/hooks/useTheMind';
import { RulesModal, HelpButton } from '@/components/the-mind';

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
    <main className="min-h-screen flex flex-col items-center px-4 py-8 safe-area-top safe-area-bottom">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link href="/" className="inline-block mb-6">
          <span className="text-slate-400 text-sm">← Volver</span>
        </Link>

        <motion.div
          className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl"
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <span className="text-5xl">🧠</span>
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-2">The Mind</h1>
        <p className="text-slate-400 max-w-sm mx-auto">
          Sincronizacion mental. Juega cartas en orden sin hablar.
        </p>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {mode === 'menu' && (
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('create')}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold text-lg shadow-lg"
            >
              Crear Partida
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('join')}
              className="w-full py-4 px-6 bg-slate-700 rounded-xl text-white font-medium"
            >
              Unirse a Partida
            </motion.button>

            {/* How to play */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <h3 className="text-white font-medium mb-4 text-center">Como jugar</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🃏', text: 'Recibe cartas' },
                  { icon: '🧠', text: 'Sincroniza' },
                  { icon: '📊', text: 'Juega en orden' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-3 text-center"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-slate-400 text-xs">{item.text}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('menu')}
              className="text-slate-400 text-sm mb-4"
            >
              ← Volver
            </button>

            <h2 className="text-xl font-bold text-white mb-4">Crear Partida</h2>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Tu nombre</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej: Maria"
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={loading || !playerName.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Partida'}
            </motion.button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('menu')}
              className="text-slate-400 text-sm mb-4"
            >
              ← Volver
            </button>

            <h2 className="text-xl font-bold text-white mb-4">Unirse a Partida</h2>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Codigo de sala</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="XXXX"
                maxLength={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-widest uppercase placeholder-slate-500 focus:outline-none focus:border-sky-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Tu nombre</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej: Maria"
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={loading || !playerName.trim() || roomCode.length !== 4}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold disabled:opacity-50"
            >
              {loading ? 'Uniendose...' : 'Unirse'}
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Help button */}
      <HelpButton onClick={() => setShowRules(true)} />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
