'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheMind } from '@/hooks/useTheMind';

export default function JoinTheMind() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  const { joinGame, loading, error } = useTheMind();
  const [playerName, setPlayerName] = useState('');
  const [gameExists, setGameExists] = useState<boolean | null>(null);

  // Check if game exists
  useEffect(() => {
    async function checkGame() {
      try {
        const response = await fetch(`/api/the-mind?roomCode=${roomCode}`);
        const data = await response.json();
        setGameExists(data.success);
      } catch {
        setGameExists(false);
      }
    }
    checkGame();
  }, [roomCode]);

  const handleJoin = async () => {
    if (!playerName.trim()) return;
    const success = await joinGame(roomCode, playerName.trim());
    if (success) {
      router.push(`/the-mind/sala/${roomCode}`);
    }
  };

  if (gameExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (gameExists === false) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Sala no encontrada</h1>
          <p className="text-slate-400 mb-6">
            La sala {roomCode} no existe o ya termino.
          </p>
          <Link
            href="/the-mind"
            className="inline-block px-6 py-3 bg-sky-500 text-white rounded-xl font-medium"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 safe-area-top safe-area-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unirse a The Mind</h1>
          <p className="text-slate-400">
            Sala: <span className="font-mono text-white">{roomCode}</span>
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
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
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            disabled={loading || !playerName.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-xl text-white font-bold disabled:opacity-50"
          >
            {loading ? 'Uniendose...' : 'Unirse a la partida'}
          </motion.button>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/the-mind" className="text-slate-400 text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
