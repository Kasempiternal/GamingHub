'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AsesinatoJoinPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string).toUpperCase();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // Check if room exists
  useEffect(() => {
    const checkRoom = async () => {
      try {
        const response = await fetch('/api/asesinato-hk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get', roomCode }),
        });
        const data = await response.json();

        if (!data.success) {
          setError('Partida no encontrada');
        }
      } catch (err) {
        setError('Error al verificar la partida');
      } finally {
        setChecking(false);
      }
    };

    checkRoom();
  }, [roomCode]);

  const handleJoin = async () => {
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/asesinato-hk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomCode,
          playerName: name.trim(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('asesinatoPlayerId', data.data.playerId);
        sessionStorage.setItem('asesinatoPlayerName', name.trim());
        router.push(`/asesinato-hk/sala/${roomCode}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando sala...</p>
        </div>
      </main>
    );
  }

  if (error === 'Partida no encontrada') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Partida no encontrada</h1>
          <p className="text-slate-400 mb-6">La sala {roomCode} no existe o ya termino</p>
          <Link
            href="/asesinato-hk"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-800 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/asesinato-hk" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </Link>

        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-red-900/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-900 to-slate-900 rounded-2xl mb-4 border border-red-800/50">
              <span className="text-3xl">🔪</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Unirse a Partida</h1>
            <p className="text-slate-400">
              Codigo: <span className="font-mono text-red-400">{roomCode}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tu nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Detective Holmes"
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                autoFocus
              />
            </div>

            {error && error !== 'Partida no encontrada' && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Uniendose...
                </>
              ) : (
                'Unirse a la investigacion'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
