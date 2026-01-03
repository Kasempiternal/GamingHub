'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NavigationMenu } from '@/components/shared/NavigationMenu';
import { RoomShareSection } from '@/components/shared/RoomShareSection';

// Wavelength-themed animated background
function WavelengthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          bottom: '-5%',
          right: '-10%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Wave lines */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
          style={{ top: `${20 + i * 15}%` }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export default function WavelengthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'created'>('menu');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get or create device ID
  const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('wavelength_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('wavelength_device_id', deviceId);
    }
    return deviceId;
  };

  const createGame = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wavelength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          hostName: name.trim(),
          deviceId: getDeviceId(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(`wavelength_player_${data.data.game.roomCode}`, data.data.playerId);
        setCreatedRoomCode(data.data.game.roomCode);
        setMode('created');
      } else {
        setError(data.error || 'Error al crear la partida');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToRoom = () => {
    router.push(`/wavelength/sala/${createdRoomCode}`);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setError('Ingresa un código de sala');
      return;
    }
    router.push(`/wavelength/unirse/${joinCode.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <WavelengthBackground />

      {/* Navigation Menu */}
      <NavigationMenu currentGame="wavelength" />

      {/* Header with back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/" className="flex items-center gap-2 text-cyan-400/70 hover:text-cyan-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Volver</span>
        </Link>
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-cyan-500/30 relative overflow-hidden"
        >
          {/* Wavelength watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-cyan-400 text-6xl font-black">〰️ WAVE 〰️</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-6">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl relative"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(6, 182, 212, 0.3)',
                  '0 0 40px rgba(6, 182, 212, 0.5)',
                  '0 0 20px rgba(6, 182, 212, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-4xl">📻</span>
              {/* Pulsing rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400/50"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
              Longitud de Onda
            </h1>
            <p className="text-cyan-300/60 text-sm">
              Sintoniza la mente de tu equipo
            </p>
          </div>

          {/* Content */}
          {mode === 'menu' && (
            <div className="space-y-4 relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('create')}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Partida
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('join')}
                className="w-full py-4 px-6 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-medium flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Unirse
              </motion.button>

              {/* How to play */}
              <div className="mt-6 pt-5 border-t border-cyan-500/20">
                <h3 className="text-cyan-300/80 font-medium mb-4 text-center text-sm uppercase tracking-wider">Como Jugar</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: '🎯', text: 'Ve el punto' },
                    { icon: '💡', text: 'Da una pista' },
                    { icon: '🎚️', text: 'Mueve el dial' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-cyan-300/60 text-xs">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Game info */}
              <div className="text-center">
                <p className="text-cyan-400/40 text-xs">
                  Primer equipo a 10 puntos gana
                </p>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => { setMode('menu'); setError(''); }}
                className="flex items-center gap-1 text-cyan-400/70 text-sm hover:text-cyan-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-cyan-300">Crear Partida</h2>
                <p className="text-cyan-400/50 text-xs">Inicia una nueva partida</p>
              </div>

              <div>
                <label className="block text-cyan-300/70 text-sm mb-2 uppercase tracking-wider">Tu Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre..."
                  maxLength={20}
                  className="w-full px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-white placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400 focus:bg-cyan-500/20 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">{error}</div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createGame}
                disabled={loading || !name.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Creando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Crear
                  </>
                )}
              </motion.button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4 relative">
              <button
                onClick={() => { setMode('menu'); setError(''); }}
                className="flex items-center gap-1 text-cyan-400/70 text-sm hover:text-cyan-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cancelar
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-cyan-300">Unirse</h2>
                <p className="text-cyan-400/50 text-xs">Entra a una partida existente</p>
              </div>

              <div>
                <label className="block text-cyan-300/70 text-sm mb-2 uppercase tracking-wider">Codigo de Sala</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXX"
                  maxLength={4}
                  className="w-full px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-center text-2xl tracking-widest uppercase placeholder-cyan-400/30 focus:outline-none focus:border-cyan-400 focus:bg-cyan-500/20 transition-all font-mono"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">{error}</div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                disabled={joinCode.length !== 4}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Unirse
              </motion.button>
            </div>
          )}

          {mode === 'created' && (
            <RoomShareSection
              roomCode={createdRoomCode}
              gameSlug="wavelength"
              accentColor="cyan"
              playerName={name}
              onBack={() => setMode('menu')}
              onContinue={handleContinueToRoom}
            />
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-cyan-400/30 text-sm mt-6">
          4-12 jugadores • 30-45 minutos
        </p>
      </motion.div>
    </main>
  );
}
