'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NavigationMenu } from '@/components/shared/NavigationMenu';

export default function UnirseImpostor() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.roomCode as string;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [gameExists, setGameExists] = useState(false);

  useEffect(() => {
    const checkGame = async () => {
      try {
        const response = await fetch('/api/impostor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get', roomCode }),
        });
        const data = await response.json();
        setGameExists(data.success);
      } catch {
        setGameExists(false);
      } finally {
        setChecking(false);
      }
    };

    checkGame();
  }, [roomCode]);

  const handleJoin = async () => {
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/impostor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomCode: roomCode.toUpperCase(),
          playerName: name.trim(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('impostorPlayerId', data.data.playerId);
        sessionStorage.setItem('impostorPlayerName', name.trim());
        router.push(`/impostor/sala/${roomCode.toUpperCase()}`);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎭
          </motion.div>
          <p className="text-slate-400">Verificando partida...</p>
        </div>
      </main>
    );
  }

  if (!gameExists) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Partida no encontrada</h1>
          <p className="text-slate-400 mb-6">
            La partida con codigo <span className="font-mono text-white">{roomCode}</span> no existe o ha expirado.
          </p>
          <Link
            href="/impostor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu currentGame="impostor" roomCode={roomCode} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link href="/impostor" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-2xl mb-4 shadow-xl">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎭
            </motion.span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unirse a Impostor</h1>
          <p className="text-slate-400">
            Codigo: <span className="font-mono text-white text-lg">{roomCode}</span>
          </p>
        </motion.div>

        {/* Join form */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Detective Pro"
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleJoin();
                  }
                }}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uniendose...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Unirse a la Partida
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Al unirte, entraras directamente al lobby de la partida
        </p>
      </div>
    </main>
  );
}
