'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ImpostorPlayer } from '@/types/game';
import { useState, useEffect } from 'react';

interface RevealAnimationProps {
  player: ImpostorPlayer;
  onComplete?: () => void;
}

export function RevealAnimation({ player, onComplete }: RevealAnimationProps) {
  const [stage, setStage] = useState<'drumroll' | 'reveal' | 'role'>('drumroll');

  useEffect(() => {
    // Drumroll phase
    const timer1 = setTimeout(() => setStage('reveal'), 2000);
    // Role reveal phase
    const timer2 = setTimeout(() => setStage('role'), 3500);
    // Complete
    const timer3 = setTimeout(() => onComplete?.(), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const getRoleColor = () => {
    switch (player.role) {
      case 'impostor':
        return 'from-red-600 to-red-800';
      case 'mr-white':
        return 'from-gray-400 to-gray-600';
      case 'civilian':
        return 'from-green-600 to-green-800';
      default:
        return 'from-slate-600 to-slate-800';
    }
  };

  const getRoleText = () => {
    switch (player.role) {
      case 'impostor':
        return '¡ERA UN IMPOSTOR!';
      case 'mr-white':
        return '¡ERA MR. WHITE!';
      case 'civilian':
        return 'Era un civil inocente...';
      default:
        return '???';
    }
  };

  const getRoleEmoji = () => {
    switch (player.role) {
      case 'impostor':
        return '🕵️';
      case 'mr-white':
        return '👻';
      case 'civilian':
        return '😢';
      default:
        return '❓';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center max-w-md w-full">
        <AnimatePresence mode="wait">
          {stage === 'drumroll' && (
            <motion.div
              key="drumroll"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="space-y-6"
            >
              {/* Mystery card spinning */}
              <motion.div
                className="w-48 h-64 mx-auto bg-gradient-to-br from-red-600 to-red-900 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-red-400"
                animate={{
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotateY: { duration: 0.8, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <motion.span
                  className="text-8xl"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  ❓
                </motion.span>
              </motion.div>

              <motion.p
                className="text-2xl text-white font-bold"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                Revelando identidad...
              </motion.p>

              {/* Drumroll dots */}
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-4 h-4 bg-red-400 rounded-full"
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="space-y-4"
            >
              {/* Player avatar big reveal */}
              <motion.div
                className="text-9xl"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                {player.avatar}
              </motion.div>

              <motion.p
                className="text-3xl text-white font-bold"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {player.name}
              </motion.p>

              <motion.p
                className="text-xl text-slate-400"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ha sido eliminado
              </motion.p>
            </motion.div>
          )}

          {stage === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="space-y-6"
            >
              {/* Role reveal with particles */}
              <motion.div
                className={`
                  relative w-64 h-80 mx-auto rounded-2xl shadow-2xl
                  bg-gradient-to-br ${getRoleColor()}
                  flex flex-col items-center justify-center gap-4 p-6
                `}
                animate={{
                  boxShadow: player.role === 'impostor'
                    ? ['0 0 20px rgba(220, 38, 38, 0.5)', '0 0 60px rgba(220, 38, 38, 0.8)', '0 0 20px rgba(220, 38, 38, 0.5)']
                    : player.role === 'mr-white'
                    ? ['0 0 20px rgba(156, 163, 175, 0.5)', '0 0 60px rgba(156, 163, 175, 0.8)', '0 0 20px rgba(156, 163, 175, 0.5)']
                    : ['0 0 20px rgba(34, 197, 94, 0.5)', '0 0 60px rgba(34, 197, 94, 0.8)', '0 0 20px rgba(34, 197, 94, 0.5)'],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.span
                  className="text-7xl"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {getRoleEmoji()}
                </motion.span>

                <div className="text-center">
                  <p className="text-6xl mb-2">{player.avatar}</p>
                  <p className="text-xl text-white font-bold">{player.name}</p>
                </div>

                <motion.p
                  className="text-white font-bold text-lg text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {getRoleText()}
                </motion.p>

                {player.word && (
                  <motion.p
                    className="text-white/70 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Palabra: {player.word}
                  </motion.p>
                )}
              </motion.div>

              {/* Floating particles for impostor reveal */}
              {player.role === 'impostor' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-red-500 rounded-full"
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                      }}
                      animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
