'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImpostorRole } from '@/types/game';

interface WordRevealProps {
  word: string | null;
  hint: string | null;
  role: ImpostorRole | null;
  category?: string;
}

export function WordReveal({ word, hint, role, category }: WordRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRevealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide after max reveal time (5 seconds)
  useEffect(() => {
    if (isRevealed) {
      maxRevealTimeoutRef.current = setTimeout(() => {
        setIsRevealed(false);
      }, 5000);
    }

    return () => {
      if (maxRevealTimeoutRef.current) {
        clearTimeout(maxRevealTimeoutRef.current);
      }
    };
  }, [isRevealed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
      if (maxRevealTimeoutRef.current) {
        clearTimeout(maxRevealTimeoutRef.current);
      }
    };
  }, []);

  const getRoleName = () => {
    switch (role) {
      case 'impostor':
        return 'IMPOSTOR';
      case 'mr-white':
        return 'MR. WHITE';
      case 'civilian':
        return 'CIVIL';
      default:
        return '???';
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'impostor':
        return '🕵️';
      case 'mr-white':
        return '👻';
      case 'civilian':
        return '👤';
      default:
        return '❓';
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsRevealed(true);
  };

  const handlePointerUp = () => {
    setIsRevealed(false);
    if (maxRevealTimeoutRef.current) {
      clearTimeout(maxRevealTimeoutRef.current);
    }
  };

  const handlePointerLeave = () => {
    setIsRevealed(false);
    if (maxRevealTimeoutRef.current) {
      clearTimeout(maxRevealTimeoutRef.current);
    }
  };

  const handlePointerCancel = () => {
    setIsRevealed(false);
    if (maxRevealTimeoutRef.current) {
      clearTimeout(maxRevealTimeoutRef.current);
    }
  };

  if (!role) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 text-center border border-slate-700">
        <p className="text-slate-400">Esperando asignacion de rol...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border-2 cursor-pointer select-none bg-gradient-to-br from-slate-700 to-slate-900 border-slate-600"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: 'none' }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Content layer */}
        <div className="p-6 min-h-[180px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!isRevealed ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                {/* Fingerprint/hold icon */}
                <motion.div
                  className="text-5xl mb-4 opacity-60"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  👆
                </motion.div>
                <p className="text-white/70 font-medium mb-1">
                  Mantén presionado
                </p>
                <p className="text-white/40 text-sm">
                  para ver tu rol
                </p>

                {/* Hold indicator ring */}
                <motion.div
                  className="mt-4 w-16 h-16 mx-auto border-2 border-white/20 rounded-full flex items-center justify-center"
                  animate={{
                    borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-8 h-8 bg-white/10 rounded-full" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="text-center w-full"
              >
                {/* Role badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 mb-4"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <span className="text-2xl">{getRoleIcon()}</span>
                  <span className="font-bold text-white tracking-wider text-sm">
                    {getRoleName()}
                  </span>
                </motion.div>

                {/* Word */}
                {word ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="text-white/50 text-xs mb-1">Tu palabra:</p>
                    <p className="text-2xl font-bold text-white tracking-wide">
                      {word.toUpperCase()}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    className="text-white/60 text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    No tienes palabra asignada
                  </motion.p>
                )}

                {/* Hint for impostors and mr white */}
                {hint && (
                  <motion.div
                    className="mt-3 px-3 py-1.5 rounded-lg bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-white/40 text-xs mb-0.5">Pista:</p>
                    <p className="text-amber-300/80 text-sm font-medium">{hint}</p>
                  </motion.div>
                )}

                {/* Category */}
                {category && (
                  <motion.p
                    className="mt-2 text-white/30 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {category}
                  </motion.p>
                )}

                {/* Release indicator */}
                <motion.p
                  className="mt-3 text-white/30 text-xs"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Suelta para ocultar
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Role-specific instructions (always visible below card) */}
      <motion.div
        className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {role === 'impostor' && (
          <div className="text-sm text-slate-300">
            <p className="text-slate-400 font-semibold mb-1">🎭 Tu mision:</p>
            <p>Describe tu palabra sin que los civiles sospechen. Tu palabra es diferente a la de ellos!</p>
          </div>
        )}
        {role === 'mr-white' && (
          <div className="text-sm text-slate-300">
            <p className="text-slate-400 font-semibold mb-1">🎭 Tu mision:</p>
            <p>No sabes la palabra. Usa la pista para adivinar y mezclarte con los civiles.</p>
          </div>
        )}
        {role === 'civilian' && (
          <div className="text-sm text-slate-300">
            <p className="text-slate-400 font-semibold mb-1">🎭 Tu mision:</p>
            <p>Describe tu palabra sin revelarla. Encuentra a los impostores por sus descripciones sospechosas!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
