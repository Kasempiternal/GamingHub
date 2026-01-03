'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function WavelengthJoinPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string).toUpperCase();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(true);
  const [error, setError] = useState('');
  const [roomExists, setRoomExists] = useState(false);

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

  // Check if room exists and if player is already in it
  useEffect(() => {
    const checkRoom = async () => {
      try {
        // First check if player already has access
        const storedPlayerId = localStorage.getItem(`wavelength_player_${roomCode}`);
        const deviceId = getDeviceId();

        const response = await fetch('/api/wavelength', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'join',
            roomCode,
            deviceId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Auto-reconnected by device ID
          localStorage.setItem(`wavelength_player_${roomCode}`, data.data.playerId);
          router.push(`/wavelength/sala/${roomCode}`);
          return;
        }

        // Check if room exists (will return error if game started without player)
        if (data.error === 'La partida ya ha comenzado') {
          setError('La partida ya ha comenzado');
          setRoomExists(true);
        } else if (data.error === 'Partida no encontrada') {
          setError('Partida no encontrada');
          setRoomExists(false);
        } else if (data.error === 'Nombre requerido') {
          // Room exists and is joinable
          setRoomExists(true);
        } else {
          setRoomExists(true);
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setCheckingRoom(false);
      }
    };

    checkRoom();
  }, [roomCode, router]);

  const joinGame = async () => {
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
          action: 'join',
          roomCode,
          playerName: name.trim(),
          deviceId: getDeviceId(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(`wavelength_player_${roomCode}`, data.data.playerId);
        router.push(`/wavelength/sala/${roomCode}`);
      } else {
        setError(data.error || 'Error al unirse');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (checkingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📻</div>
          <p className="text-white/60">Verificando sala...</p>
        </div>
      </div>
    );
  }

  if (!roomExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">😕</div>
          <p className="text-white text-lg">Partida no encontrada</p>
          <p className="text-white/60">El código {roomCode} no existe</p>
          <Link
            href="/wavelength"
            className="inline-block px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back button */}
      <Link
        href="/wavelength"
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
          <h1 className="text-3xl font-bold text-white mb-2">Unirse a Partida</h1>
          <p className="text-cyan-400 font-mono text-2xl tracking-widest">{roomCode}</p>
        </div>

        {/* Join form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && joinGame()}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center text-lg"
            autoFocus
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinGame}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg transition-all hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uniéndose...' : 'Unirse a la Partida'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
