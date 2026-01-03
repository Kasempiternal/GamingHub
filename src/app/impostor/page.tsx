'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TOTAL_WORD_PAIRS } from '@/data/impostorWords';
import { RulesModal, RulesButton } from '@/components/impostor';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { RoomShareSection } from '@/components/shared/RoomShareSection';

export default function ImpostorHome() {
  const router = useRouter();
  const [mode, setMode] = useState<'home' | 'create' | 'join' | 'created'>('home');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleCreate = async () => {
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
        body: JSON.stringify({ action: 'create', hostName: name.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('impostorPlayerId', data.data.playerId);
        sessionStorage.setItem('impostorPlayerName', name.trim());
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
    router.push(`/impostor/sala/${createdRoomCode}`);
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
      const response = await fetch('/api/impostor', {
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
        sessionStorage.setItem('impostorPlayerId', data.data.playerId);
        sessionStorage.setItem('impostorPlayerName', name.trim());
        router.push(`/impostor/sala/${roomCode.toUpperCase().trim()}`);
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
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu currentGame="impostor" />

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-amber-500 rounded-2xl mb-4 shadow-2xl">
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎭
            </motion.span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Impostor
          </h1>
          <p className="text-slate-400">
            Encuentra al impostor entre nosotros
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {TOTAL_WORD_PAIRS}+ pares de palabras
          </p>
        </motion.div>

        {/* Main content card */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {mode === 'home' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
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
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Unirse a Partida
                </span>
              </button>

              {/* How to play */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Como se juega?
                </h3>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">-</span>
                    Los <span className="text-green-400">civiles</span> tienen la misma palabra
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">-</span>
                    Los <span className="text-red-400">impostores</span> tienen una palabra diferente
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">-</span>
                    Describe tu palabra sin revelarla
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">-</span>
                    Encuentra y vota al impostor!
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
                  placeholder="Ej: Detective Pro"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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
                  placeholder="Ej: Detective Pro"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors text-center text-2xl tracking-widest font-mono uppercase"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
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
              gameSlug="impostor"
              accentColor="red"
              playerName={name}
              onBack={() => setMode('home')}
              onContinue={handleContinueToRoom}
            />
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          3-15 jugadores - Mejor con 6+
        </p>
      </div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Floating Rules Button */}
      <RulesButton onClick={() => setShowRules(true)} />
    </main>
  );
}
