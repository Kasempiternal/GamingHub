'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useHipster } from '@/hooks/useHipster';
import { HIPSTER_AVATARS } from '@/types/game';

// Music-themed background
function MusicBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A24] via-[#2D1B4E] to-[#1A0A24]" />

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Floating music notes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-purple-400/10 text-4xl pointer-events-none select-none"
          style={{
            left: `${10 + i * 12}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {['🎵', '🎶', '🎼', '🎹', '🎸'][i % 5]}
        </motion.div>
      ))}
    </div>
  );
}

export default function JoinHipster() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  const { joinGame, loading, error } = useHipster();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    HIPSTER_AVATARS[Math.floor(Math.random() * HIPSTER_AVATARS.length)]
  );
  const [gameExists, setGameExists] = useState<boolean | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Check if game exists
  useEffect(() => {
    async function checkGame() {
      try {
        const response = await fetch(`/api/hipster?roomCode=${roomCode}`);
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
    const success = await joinGame(roomCode, playerName.trim(), selectedAvatar);
    if (success) {
      router.push(`/hipster/sala/${roomCode}`);
    }
  };

  if (gameExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <MusicBackground />
        <motion.div
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (gameExists === false) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <MusicBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-purple-900/60 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 relative z-10"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-purple-300 mb-2">Sala no encontrada</h1>
          <p className="text-purple-400/60 mb-6">
            La sala con codigo <span className="font-mono">{roomCode}</span> no existe o ha terminado.
          </p>
          <Link
            href="/hipster"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom relative overflow-hidden">
      <MusicBackground />

      {/* Back button */}
      <div className="absolute top-6 left-4 z-10">
        <Link href="/hipster" className="flex items-center gap-2 text-purple-400/70 hover:text-purple-300 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Salir</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          className="bg-purple-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-purple-500/30 relative overflow-hidden"
        >
          {/* Vinyl watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <span className="text-purple-400 text-6xl font-black">HIPSTER</span>
          </div>

          {/* Header */}
          <div className="relative text-center mb-6">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl relative"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(147, 51, 234, 0.3)',
                  '0 0 40px rgba(147, 51, 234, 0.5)',
                  '0 0 20px rgba(147, 51, 234, 0.3)'
                ],
                rotate: [0, 360],
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity },
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              }}
            >
              <span className="text-4xl">🎵</span>
              {/* Vinyl grooves */}
              <div className="absolute inset-2 rounded-full border border-white/10" />
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-6 rounded-full border border-white/10" />
            </motion.div>

            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              Unirse a la Sala
            </h1>
            <p className="text-purple-300/60 text-sm">
              Codigo: <span className="font-mono text-purple-400">{roomCode}</span>
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 relative">
            {/* Avatar selector */}
            <div>
              <label className="block text-purple-300/70 text-sm mb-2 uppercase tracking-wider">Tu Avatar</label>
              <motion.button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between text-white transition-all hover:border-purple-400"
              >
                <span className="text-2xl">{selectedAvatar}</span>
                <span className="text-purple-300/60 text-sm">Toca para cambiar</span>
              </motion.button>

              {/* Avatar picker dropdown */}
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-purple-900/80 border border-purple-500/30 rounded-xl"
                >
                  <div className="grid grid-cols-8 gap-2">
                    {HIPSTER_AVATARS.map((avatar) => (
                      <motion.button
                        key={avatar}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedAvatar(avatar);
                          setShowAvatarPicker(false);
                        }}
                        className={`text-2xl p-1 rounded-lg transition-colors ${
                          selectedAvatar === avatar
                            ? 'bg-purple-500/30 ring-2 ring-purple-400'
                            : 'hover:bg-purple-500/20'
                        }`}
                      >
                        {avatar}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Name input */}
            <div>
              <label className="block text-purple-300/70 text-sm mb-2 uppercase tracking-wider">Tu Nombre</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="DJ Estrella..."
                maxLength={20}
                className="w-full px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-white placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:bg-purple-500/20 transition-all"
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
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Entrando...
                </>
              ) : (
                <>
                  <span>🎧</span>
                  Unirse al Juego
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Game info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center text-purple-300/50 text-sm"
        >
          <p>El juego de adivinar canciones 🎵</p>
        </motion.div>
      </motion.div>
    </main>
  );
}
