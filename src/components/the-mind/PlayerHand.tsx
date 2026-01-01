'use client';

import { motion } from 'framer-motion';
import { PlayingCard } from './PlayingCard';

interface PlayerHandProps {
  cards: number[];
  canPlay: boolean;
  onPlayCard: (value: number) => void;
}

export function PlayerHand({ cards, canPlay, onPlayCard }: PlayerHandProps) {
  if (cards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-slate-400"
      >
        <p>Sin cartas</p>
      </motion.div>
    );
  }

  // Calculate fan spread based on number of cards
  const totalCards = cards.length;
  const maxRotation = Math.min(totalCards * 5, 30);
  const rotationStep = totalCards > 1 ? (maxRotation * 2) / (totalCards - 1) : 0;

  return (
    <div className="relative flex items-end justify-center min-h-[140px] py-4">
      {cards.map((card, index) => {
        const rotation = totalCards > 1
          ? -maxRotation + (index * rotationStep)
          : 0;
        const yOffset = Math.abs(rotation) * 0.5;

        return (
          <motion.div
            key={card}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: yOffset,
              rotate: rotation,
            }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            style={{
              marginLeft: index > 0 ? '-20px' : 0,
              zIndex: index,
            }}
          >
            <PlayingCard
              value={card}
              isPlayable={canPlay}
              size="lg"
              onClick={() => onPlayCard(card)}
              delay={0}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
