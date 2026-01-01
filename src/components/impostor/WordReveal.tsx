'use client';

import { useState, useRef } from 'react';
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
  const [dragProgress, setDragProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getRoleColor = () => {
    switch (role) {
      case 'impostor':
        return 'from-red-600 to-red-800 border-red-500';
      case 'mr-white':
        return 'from-gray-400 to-gray-600 border-gray-300';
      case 'civilian':
        return 'from-green-600 to-green-800 border-green-500';
      default:
        return 'from-slate-600 to-slate-800 border-slate-500';
    }
  };

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

  const handleDragStart = () => {
    if (!isRevealed) {
      isDragging.current = true;
    }
  };

  const handleDrag = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let clientY: number;

    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }

    const progress = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setDragProgress(progress);

    if (progress > 0.7) {
      setIsRevealed(true);
      isDragging.current = false;
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    if (!isRevealed) {
      setDragProgress(0);
    }
  };

  const handleClick = () => {
    setIsRevealed(!isRevealed);
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
        className={`
          relative overflow-hidden rounded-2xl border-2 cursor-pointer
          bg-gradient-to-br ${getRoleColor()}
          ${!isRevealed ? 'select-none' : ''}
        `}
        onClick={handleClick}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        whileTap={{ scale: 0.98 }}
      >
        {/* Hidden content layer */}
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
                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    rotateY: [0, 180, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎭
                </motion.div>
                <p className="text-white/80 font-medium mb-2">
                  Toca para revelar tu rol
                </p>
                <p className="text-white/50 text-sm">
                  o desliza hacia abajo
                </p>

                {/* Drag indicator */}
                <motion.div
                  className="mt-4 w-12 h-1 bg-white/30 rounded-full mx-auto"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="text-center w-full"
              >
                {/* Role badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <span className="text-2xl">{getRoleIcon()}</span>
                  <span className="font-bold text-white tracking-wider">
                    {getRoleName()}
                  </span>
                </motion.div>

                {/* Word */}
                {word ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <p className="text-white/60 text-sm mb-1">Tu palabra:</p>
                    <p className="text-3xl font-bold text-white tracking-wide">
                      {word.toUpperCase()}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    className="text-white/70 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    No tienes palabra asignada
                  </motion.p>
                )}

                {/* Hint for impostors and mr white */}
                {hint && (
                  <motion.div
                    className="mt-4 px-4 py-2 rounded-lg bg-black/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-white/60 text-xs mb-1">Pista:</p>
                    <p className="text-yellow-300 font-medium">{hint}</p>
                  </motion.div>
                )}

                {/* Category */}
                {category && (
                  <motion.p
                    className="mt-3 text-white/40 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Categoria: {category}
                  </motion.p>
                )}

                {/* Tap to hide */}
                <motion.p
                  className="mt-4 text-white/40 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Toca para ocultar
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drag overlay */}
        {!isRevealed && dragProgress > 0 && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
            style={{ opacity: dragProgress }}
          >
            <p className="text-white text-xl font-bold">
              {dragProgress > 0.7 ? '¡Suelta!' : 'Sigue deslizando...'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Role-specific instructions */}
      {isRevealed && (
        <motion.div
          className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {role === 'impostor' && (
            <div className="text-sm text-slate-300">
              <p className="text-red-400 font-semibold mb-1">🕵️ Tu mision:</p>
              <p>Describe tu palabra sin que los civiles sospechen. Tu palabra es diferente a la de ellos!</p>
            </div>
          )}
          {role === 'mr-white' && (
            <div className="text-sm text-slate-300">
              <p className="text-gray-300 font-semibold mb-1">👻 Tu mision:</p>
              <p>No sabes la palabra. Usa la pista para adivinar y mezclarte con los civiles.</p>
            </div>
          )}
          {role === 'civilian' && (
            <div className="text-sm text-slate-300">
              <p className="text-green-400 font-semibold mb-1">👤 Tu mision:</p>
              <p>Describe tu palabra sin revelarla. Encuentra a los impostores por sus descripciones sospechosas!</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
