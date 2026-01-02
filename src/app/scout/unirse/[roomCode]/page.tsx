'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useScout } from '@/hooks/useScout';
import { CircusBackground } from '@/components/themes';

export default function JoinScout() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  const { joinGame, loading, error } = useScout();
  const [playerName, setPlayerName] = useState('');
  const [gameExists, setGameExists] = useState<boolean | null>(null);

  // Check if game exists
  useEffect(() => {
    async function checkGame() {
      try {
        const response = await fetch(`/api/scout?roomCode=${roomCode}`);
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
      router.push(`/scout/sala/${roomCode}`);
    }
  };

  if (gameExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <CircusBackground />
        <motion.div
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (gameExists === false) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <CircusBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/30 relative z-10"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-amber-300 mb-2">Show no encontrado</h1>
          <p className="text-amber-400/60 mb-6">
            El circo con codigo {roomCode} no existe o se ha cerrado.
          </p>
          <Link
            href="/scout"
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-xl font-medium"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <CircusBackground />

      {/* Back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/scout" className="flex items-center gap-2 text-amber-400/70 hover:text-amber-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Salir</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-amber-500/30 relative overflow-hidden"
        >
          {/* Circus watermark */}
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
            </motion.div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent mb-1">
              Unirse al Show
            </h1>
            <p className="text-amber-300/60 text-sm">
              Codigo: <span className="font-mono text-amber-400">{roomCode}</span>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 relative">
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
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">{error}</div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
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
                  Entrando...
                </>
              ) : (
                <>
                  <span>🎟️</span>
                  Entrar al Circo
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
