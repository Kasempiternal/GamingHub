'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TheMindCard } from '@/types/game';
import { useMemo } from 'react';

interface PlayedPileProps {
  cards: TheMindCard[];
  lastPlayedCard: number | null;
  conflictCards: number[];
}

export function PlayedPile({ cards, lastPlayedCard, conflictCards }: PlayedPileProps) {
  // Show last 5 cards max
  const visibleCards = cards.slice(-5);

  // Pre-compute rotations so they don't change on re-render
  const cardRotations = useMemo(() => {
    return visibleCards.map(() => (Math.random() - 0.5) * 10);
  }, [visibleCards.length]);

  const getCardEdgeColor = (value: number, isConflict: boolean) => {
    if (isConflict) return 'from-red-500 to-red-700';
    // Color based on card value range
    if (value <= 20) return 'from-emerald-500 to-emerald-700';
    if (value <= 40) return 'from-sky-500 to-sky-700';
    if (value <= 60) return 'from-amber-500 to-amber-700';
    if (value <= 80) return 'from-orange-500 to-orange-700';
    return 'from-rose-500 to-rose-700';
  };

  const getAccentColor = (value: number, isConflict: boolean) => {
    if (isConflict) return 'border-red-300/40';
    if (value <= 20) return 'border-emerald-300/40';
    if (value <= 40) return 'border-sky-300/40';
    if (value <= 60) return 'border-amber-300/40';
    if (value <= 80) return 'border-orange-300/40';
    return 'border-rose-300/40';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pile label */}
      <span className="text-slate-400 text-sm">Mesa</span>

      {/* Card pile */}
      <div className="relative h-32 w-24 flex items-center justify-center">
        {cards.length === 0 ? (
          <div className="w-20 h-28 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center bg-slate-800/50">
            <span className="text-slate-500 text-sm">Vacio</span>
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
                    rotate: cardRotations[index] || 0,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`
                    absolute w-16 h-22 rounded-xl
                    flex items-center justify-center
                    font-bold text-white
                    shadow-lg overflow-hidden
                    bg-gradient-to-br ${getCardEdgeColor(card.value, isConflict)}
                  `}
                  style={{ zIndex: index }}
                >
                  {/* Card face background */}
                  <div className="absolute inset-[3px] rounded-lg bg-slate-900/90" />

                  {/* Inner decorative border */}
                  <div className={`absolute inset-[5px] rounded-md border-2 ${getAccentColor(card.value, isConflict)}`} />

                  {/* Corner numbers - top left */}
                  <div className="absolute top-1 left-1.5 text-[9px] text-white/80 font-bold">
                    {card.value}
                  </div>

                  {/* Corner numbers - bottom right (rotated) */}
                  <div className="absolute bottom-1 right-1.5 text-[9px] text-white/80 font-bold rotate-180">
                    {card.value}
                  </div>

                  {/* Center number */}
                  <span className="relative z-10 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
                    {card.value}
                  </span>

                  {/* Diamond decorations */}
                  <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-1 h-1 bg-white/25 rotate-45" />
                  <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-1 h-1 bg-white/25 rotate-45" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl pointer-events-none" />

                  {isLast && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/30"
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
          <div className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">{lastPlayedCard}</div>
        </motion.div>
      )}
    </div>
  );
}
