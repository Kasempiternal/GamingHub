'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SpyBackground } from '@/components/themes';
import { NavigationMenu } from '@/components/shared/NavigationMenu';

export default function UnirsePartida() {
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
        const response = await fetch('/api/codigo-secreto', {
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
      const response = await fetch('/api/codigo-secreto', {
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
        sessionStorage.setItem('playerId', data.data.playerId);
        sessionStorage.setItem('playerName', name.trim());
        router.push(`/codigo-secreto/sala/${roomCode.toUpperCase()}`);
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
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <SpyBackground />
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-amber-400/70">Verificando mision...</p>
        </div>
      </main>
    );
  }

  if (!gameExists) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <SpyBackground />
        <motion.div
          className="text-center max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-amber-600/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-amber-300 mb-2">Mision no encontrada</h1>
          <p className="text-amber-400/60 mb-6">
            El codigo de acceso <span className="font-mono text-amber-400">{roomCode}</span> no existe o ha expirado.
          </p>
          <Link
            href="/codigo-secreto"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Abortar mision
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <SpyBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="codigo-secreto" roomCode={roomCode} />

      {/* Back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/codigo-secreto" className="flex items-center gap-2 text-amber-400/70 hover:text-amber-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Abortar</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-amber-600/30 relative overflow-hidden"
        >
          {/* Classified watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-amber-400 text-6xl font-black rotate-[-15deg]">CLASSIFIED</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-6">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-2xl relative"
              whileHover={{ rotate: [0, -5, 5, 0] }}
            >
              <span className="text-4xl">🕵️</span>
              {/* Top secret badge */}
              <motion.div
                className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                TOP SECRET
              </motion.div>
            </motion.div>

            <h1 className="text-2xl font-bold text-amber-400 mb-1">
              Unirse a Mision
            </h1>
            <p className="text-amber-300/60 text-sm">
              Codigo: <span className="font-mono text-amber-400">{roomCode}</span>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 relative">
            <div>
              <label className="block text-amber-300/70 text-sm mb-2 uppercase tracking-wider">Nombre de Agente</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agente..."
                maxLength={20}
                className="w-full px-4 py-3 bg-amber-500/10 border border-amber-600/30 rounded-xl text-white placeholder-amber-400/40 focus:outline-none focus:border-amber-400 focus:bg-amber-500/20 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleJoin();
                  }
                }}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">{error}</div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Infiltrando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Infiltrar Mision
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
