'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LivesDisplayProps {
  lives: number;
  maxLives: number;
}

export function LivesDisplay({ lives, maxLives }: LivesDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 text-sm mr-1">Vidas</span>
      <div className="flex gap-1">
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i < lives ? 1 : 0.7,
              opacity: i < lives ? 1 : 0.3,
            }}
            className="relative"
          >
            <motion.span
              className="text-2xl"
              animate={i < lives ? {
                scale: [1, 1.2, 1],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {i < lives ? '❤️' : '🖤'}
            </motion.span>

            {/* Lost life animation */}
            <AnimatePresence>
              {i === lives && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-2xl">💔</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
