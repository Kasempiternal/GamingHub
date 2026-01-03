'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TOTAL_WORDS } from '@/data/words';
import { RulesModal, RulesButton } from '@/components/codigo-secreto';
import { SpyBackground } from '@/components/themes';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { RoomShareSection } from '@/components/shared/RoomShareSection';

export default function CodigoSecretoHome() {
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
      const response = await fetch('/api/codigo-secreto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', hostName: name.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('playerId', data.data.playerId);
        sessionStorage.setItem('playerName', name.trim());
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
    router.push(`/codigo-secreto/sala/${createdRoomCode}`);
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
      const response = await fetch('/api/codigo-secreto', {
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
        sessionStorage.setItem('playerId', data.data.playerId);
        sessionStorage.setItem('playerName', name.trim());
        router.push(`/codigo-secreto/sala/${roomCode.toUpperCase().trim()}`);
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      {/* Spy Theme Background */}
      <SpyBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="codigo-secreto" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to hub */}
        <Link href="/" className="inline-flex items-center gap-2 text-amber-400/70 hover:text-amber-300 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Hub
        </Link>

        {/* Logo and title - Spy themed */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Classified badge */}
          <motion.div
            className="inline-block mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-amber-500/30">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🕵️
                </motion.span>
              </div>
              {/* TOP SECRET stamp */}
              <motion.div
                className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded rotate-12"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                TOP SECRET
              </motion.div>
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold text-amber-100 mb-2 tracking-tight">
            Codigo Secreto
          </h1>
          <p className="text-amber-400/60 font-medium">
            Operacion clasificada - Nivel 5
          </p>
          <p className="text-amber-500/40 text-sm mt-1">
            {TOTAL_WORDS}+ palabras en la base de datos
          </p>
        </motion.div>

        {/* Main content card - Classified document style */}
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-amber-600/30 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Classified watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-amber-400 text-6xl font-black rotate-[-15deg]">CLASSIFIED</span>
          </div>

          {mode === 'home' && (
            <div className="space-y-4 relative">
              <motion.button
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg border border-amber-500/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Iniciar Nueva Mision
                </span>
              </motion.button>

              <motion.button
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 font-semibold rounded-xl transition-all border border-amber-600/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Unirse a Mision
                </span>
              </motion.button>

              {/* Mission briefing */}
              <div className="mt-6 pt-6 border-t border-amber-600/20">
                <h3 className="text-amber-300 font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Informe de Mision
                </h3>
                <ul className="text-sm text-amber-100/60 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">▸</span>
                    Equipo <span className="text-red-400 font-medium">Rojo</span> vs Equipo <span className="text-blue-400 font-medium">Azul</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">▸</span>
                    Cada equipo tiene un <span className="text-amber-300 font-medium">Jefe de Espias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">▸</span>
                    Descifra las palabras con pistas secretas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">▸</span>
                    Evita al <span className="text-slate-300 font-medium">Asesino</span> a toda costa
                  </li>
                </ul>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => { setMode('home'); setError(''); }}
                className="text-amber-400/70 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>

              <h2 className="text-xl font-semibold text-amber-100 flex items-center gap-2">
                <span className="text-amber-500">📋</span>
                Crear Nueva Mision
              </h2>

              <div>
                <label className="block text-sm text-amber-400/60 mb-2 uppercase tracking-wider">Nombre Clave del Agente</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Agente Shadow"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-amber-600/30 rounded-xl text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              )}

              <motion.button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-amber-500/30"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Iniciando mision...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Iniciar Mision
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => { setMode('home'); setError(''); }}
                className="text-amber-400/70 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>

              <h2 className="text-xl font-semibold text-amber-100 flex items-center gap-2">
                <span className="text-amber-500">🔐</span>
                Acceso a Mision
              </h2>

              <div>
                <label className="block text-sm text-amber-400/60 mb-2 uppercase tracking-wider">Nombre Clave del Agente</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Agente Shadow"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-amber-600/30 rounded-xl text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-400/60 mb-2 uppercase tracking-wider">Codigo de Acceso</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-amber-600/30 rounded-xl text-amber-100 placeholder-amber-500/30 focus:outline-none focus:border-amber-500 transition-colors text-center text-2xl tracking-[0.3em] font-mono uppercase"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              )}

              <motion.button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-amber-500/30"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Verificando acceso...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Acceder a Mision
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'created' && (
            <RoomShareSection
              roomCode={createdRoomCode}
              gameSlug="codigo-secreto"
              accentColor="amber"
              playerName={name}
              onBack={() => setMode('home')}
              onContinue={handleContinueToRoom}
            />
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-amber-500/30 text-sm mt-6">
          Basado en Codenames de Vlaada Chvatil
        </p>
      </div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* Floating Rules Button */}
      <RulesButton onClick={() => setShowRules(true)} />
    </main>
  );
}
