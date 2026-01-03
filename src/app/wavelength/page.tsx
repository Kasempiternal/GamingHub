'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WavelengthPage() {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
        // Store player ID
        localStorage.setItem(`wavelength_player_${data.data.game.roomCode}`, data.data.playerId);
        router.push(`/wavelength/sala/${data.data.game.roomCode}`);
      } else {
        setError(data.error || 'Error al crear la partida');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = () => {
    if (!joinCode.trim()) {
      setError('Ingresa un código de sala');
      return;
    }
    router.push(`/wavelength/unirse/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-10 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span>←</span>
        <span>Volver</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md space-y-8"
      >
        {/* Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="text-6xl mb-4"
          >
            📻
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Longitud de Onda</h1>
          <p className="text-cyan-400/80">Sintoniza la mente de tu equipo</p>
        </div>

        {/* Game description */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-white/70 text-sm space-y-2">
          <p>🎯 <strong className="text-white">El psíquico</strong> ve un punto oculto en un espectro</p>
          <p>💡 <strong className="text-white">Da una pista</strong> para que su equipo lo encuentre</p>
          <p>🎚️ <strong className="text-white">El equipo</strong> mueve el dial para adivinar</p>
          <p>⚔️ <strong className="text-white">Primer equipo a 10 puntos</strong> gana</p>
        </div>

        {/* Create game form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white text-center">Crear Partida</h2>

          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createGame}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg transition-all hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Partida'}
          </motion.button>
        </div>

        {/* Join game */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white text-center">Unirse a Partida</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Código de sala"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent uppercase text-center tracking-widest font-mono text-lg"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinByCode}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-all"
            >
              Unirse
            </motion.button>
          </div>
        </div>

        {/* Game info */}
        <div className="text-center text-white/40 text-sm">
          <p>4-12 jugadores • 30-45 minutos</p>
        </div>
      </motion.div>
    </div>
  );
}
