'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TOTAL_CLUE_CARDS, TOTAL_MEANS_CARDS, TOTAL_SCENE_TILES } from '@/data/asesinatoCards';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { RoomShareSection } from '@/components/shared/RoomShareSection';

export default function AsesinatoHome() {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'create' | 'join' | 'created'>('home');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
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
        body: JSON.stringify({ action: 'create', hostName: name.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('asesinatoPlayerId', data.data.playerId);
        sessionStorage.setItem('asesinatoPlayerName', name.trim());
        setCreatedRoomCode(data.data.game.roomCode);
        setMode('created');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToRoom = () => {
    router.push(`/asesinato-hk/sala/${createdRoomCode}`);
  };

  const handleJoin = async () => {
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (roomCode.trim().length !== 6) {
      setError('El codigo debe tener 6 caracteres');
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
          roomCode: roomCode.toUpperCase().trim(),
          playerName: name.trim(),
        }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('asesinatoPlayerId', data.data.playerId);
        sessionStorage.setItem('asesinatoPlayerName', name.trim());
        router.push(`/asesinato-hk/sala/${roomCode.toUpperCase().trim()}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
      {/* Background decoration - noir theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-800/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
        {/* Blood drip effect */}
        <div className="absolute top-0 left-1/4 w-1 h-32 bg-gradient-to-b from-red-800/50 to-transparent"></div>
        <div className="absolute top-0 right-1/3 w-1 h-24 bg-gradient-to-b from-red-800/30 to-transparent"></div>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu currentGame="asesinato-hk" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to hub */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Hub
        </Link>

        {/* Logo and title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-900 to-slate-900 rounded-2xl mb-4 shadow-2xl border border-red-800/50">
            <motion.span
              className="text-4xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔪
            </motion.span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Asesinato en Hong Kong
          </h1>
          <p className="text-slate-400">
            El crimen perfecto
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {TOTAL_CLUE_CARDS} evidencias + {TOTAL_MEANS_CARDS} metodos + {TOTAL_SCENE_TILES} fichas
          </p>
        </motion.div>

        {/* Main content card */}
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-red-900/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {mode === 'home' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg border border-red-700/50"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear Nueva Partida
                </span>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg border border-slate-600/50"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Unirse a Partida
                </span>
              </button>

              {/* How to play */}
              <div className="mt-6 pt-6 border-t border-red-900/30">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Como se juega?
                </h3>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">🔬</span>
                    <span>El <span className="text-cyan-400">Científico Forense</span> conoce el crimen pero solo da pistas abstractas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">🔪</span>
                    <span>El <span className="text-red-400">Asesino</span> elige su arma y evidencia en secreto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">🔍</span>
                    <span>Los <span className="text-amber-400">Investigadores</span> analizan las pistas para resolver el caso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">⚠️</span>
                    <span>Cada jugador tiene UNA sola acusacion - usala bien!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4">
              <button
                onClick={() => { setMode('home'); setError(''); }}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>

              <h2 className="text-xl font-semibold text-white">Crear Nueva Partida</h2>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Tu nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Detective Holmes"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creando...
                  </>
                ) : (
                  'Crear Partida'
                )}
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <button
                onClick={() => { setMode('home'); setError(''); }}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>

              <h2 className="text-xl font-semibold text-white">Unirse a Partida</h2>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Tu nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Detective Holmes"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Codigo de sala</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors text-center text-2xl tracking-widest font-mono uppercase"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Uniendose...
                  </>
                ) : (
                  'Unirse'
                )}
              </button>
            </div>
          )}

          {mode === 'created' && (
            <RoomShareSection
              roomCode={createdRoomCode}
              gameSlug="asesinato-hk"
              accentColor="slate"
              playerName={name}
              onBack={() => setMode('home')}
              onContinue={handleContinueToRoom}
            />
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          4-12 jugadores - Basado en Deception: Murder in Hong Kong
        </p>
      </div>
    </main>
  );
}
