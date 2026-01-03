'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TimesUpCard, TimesUpCategory } from '@/types/game';

interface CardDisplayProps {
  card: TimesUpCard | null;
  isRevealed: boolean;
  currentRound: number;
}

const CATEGORY_COLORS: Record<TimesUpCategory, { bg: string; text: string; icon: string }> = {
  celebrity: { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: 'star' },
  fiction: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: 'book' },
  sports: { bg: 'bg-green-500/20', text: 'text-green-400', icon: 'trophy' },
  historical: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'clock' },
  music: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: 'music' },
};

const CATEGORY_LABELS: Record<TimesUpCategory, string> = {
  celebrity: 'Celebridad',
  fiction: 'Ficcion',
  sports: 'Deportes',
  historical: 'Historico',
  music: 'Musica',
};

export function CardDisplay({ card, isRevealed, currentRound }: CardDisplayProps) {
  const categoryInfo = card ? CATEGORY_COLORS[card.category] : null;

  const getRoundHint = () => {
    switch (currentRound) {
      case 1:
        return 'Describe con cualquier palabra';
      case 2:
        return 'Solo UNA palabra';
      case 3:
        return 'Solo mimica (sin hablar)';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {card && isRevealed ? (
          <motion.div
            key={card.id}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative"
            style={{ perspective: 1000 }}
          >
            {/* Card */}
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-1 shadow-2xl shadow-orange-500/30">
              <div className="bg-slate-900 rounded-3xl p-6 min-h-[200px] flex flex-col items-center justify-center">
                {/* Category badge */}
                {categoryInfo && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`${categoryInfo.bg} ${categoryInfo.text} px-3 py-1 rounded-full text-xs font-medium mb-4`}
                  >
                    {CATEGORY_LABELS[card.category]}
                  </motion.div>
                )}

                {/* Name */}
                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-bold text-white text-center leading-tight"
                >
                  {card.name}
                </motion.h2>

                {/* Round hint */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-400 text-sm mt-4 text-center"
                >
                  {getRoundHint()}
                </motion.p>
              </div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg">
                {currentRound === 1 ? '1' : currentRound === 2 ? '2' : '3'}
              </span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl p-1"
          >
            <div className="bg-slate-900 rounded-3xl p-6 min-h-[200px] flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🎭
              </motion.div>
              <p className="text-slate-400 text-center">
                Esperando la siguiente carta...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
