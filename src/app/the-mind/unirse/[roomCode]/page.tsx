'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheMind } from '@/hooks/useTheMind';
import { TelepathyBackground } from '@/components/themes';

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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <TelepathyBackground />
        <motion.div
          className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (gameExists === false) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <TelepathyBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-sky-500/30"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-sky-300 mb-2">Conexion no encontrada</h1>
          <p className="text-sky-400/60 mb-6">
            La frecuencia {roomCode} no existe o se desconecto.
          </p>
          <Link
            href="/the-mind"
            className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-medium"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <TelepathyBackground />

      {/* Back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/the-mind" className="flex items-center gap-2 text-sky-400/70 hover:text-sky-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Desconectar</span>
        </Link>
      </div>

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
            </motion.div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-1">
              Sincronizar
            </h1>
            <p className="text-sky-300/60 text-sm">
              Frecuencia: <span className="font-mono text-sky-400">{roomCode}</span>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 relative">
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
        </motion.div>
      </motion.div>
    </main>
  );
}
