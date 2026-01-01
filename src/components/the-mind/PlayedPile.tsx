'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TheMindCard } from '@/types/game';

interface PlayedPileProps {
  cards: TheMindCard[];
  lastPlayedCard: number | null;
  conflictCards: number[];
}

export function PlayedPile({ cards, lastPlayedCard, conflictCards }: PlayedPileProps) {
  // Show last 5 cards max
  const visibleCards = cards.slice(-5);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pile label */}
      <span className="text-slate-400 text-sm">Mesa</span>

      {/* Card pile */}
      <div className="relative h-32 w-24 flex items-center justify-center">
        {cards.length === 0 ? (
          <div className="w-20 h-28 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center">
            <span className="text-slate-600 text-sm">Vacio</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card, index) => {
              const isLast = card.value === lastPlayedCard;
              const isConflict = conflictCards.includes(card.value);
              const offset = (visibleCards.length - 1 - index) * 2;

              return (
                <motion.div
                  key={card.value}
                  initial={{ scale: 0.5, y: -50, opacity: 0 }}
                  animate={{
                    scale: isLast ? 1.1 : 1,
                    y: -offset,
                    x: offset * 0.5,
                    opacity: 1,
                    rotate: (Math.random() - 0.5) * 10,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    absolute w-16 h-22 rounded-xl
                    flex items-center justify-center
                    font-bold text-xl text-white
                    shadow-lg
                    ${isConflict
                      ? 'bg-gradient-to-br from-red-500 to-red-700'
                      : 'bg-gradient-to-br from-slate-500 to-slate-700'
                    }
                  `}
                  style={{ zIndex: index }}
                >
                  <div className="absolute inset-1 rounded-lg border-2 border-white/20" />
                  <span className="drop-shadow">{card.value}</span>

                  {isLast && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/30"
                      animate={{ opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1, repeat: 3 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Last played indicator */}
      {lastPlayedCard !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <span className="text-slate-500 text-xs">Ultima carta</span>
          <div className="text-2xl font-bold text-white">{lastPlayedCard}</div>
        </motion.div>
      )}
    </div>
  );
}
