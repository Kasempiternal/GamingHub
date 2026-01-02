'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoutCard, ScoutCardBack } from './ScoutCard';
import type { ScoutCard as ScoutCardType } from '@/types/game';

interface PlayerHandProps {
  cards: ScoutCardType[];
  selectedCardIds: string[];
  onCardClick?: (cardId: string) => void;
  onCardInsertPosition?: (index: number) => void;
  isCurrentPlayer: boolean;
  isOrientationPhase?: boolean;
  showInsertPositions?: boolean;
  disabled?: boolean;
}

export function PlayerHand({
  cards,
  selectedCardIds,
  onCardClick,
  onCardInsertPosition,
  isCurrentPlayer,
  isOrientationPhase = false,
  showInsertPositions = false,
  disabled = false,
}: PlayerHandProps) {
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);

  if (!isCurrentPlayer) {
    // Show card backs for opponents
    return (
      <div className="flex items-center justify-center gap-1">
        {cards.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ScoutCardBack size="small" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hand label */}
      <div className="text-center mb-2">
        <span className="text-amber-400/60 text-xs uppercase tracking-wider">Tu Mano</span>
        {isOrientationPhase && (
          <span className="text-amber-300/80 text-xs ml-2">(No puedes reordenar)</span>
        )}
      </div>

      {/* Cards container with optional insert positions */}
      <div className="flex items-end justify-center">
        {/* Insert position before first card */}
        {showInsertPositions && (
          <InsertPosition
            index={0}
            isHovered={hoveredPosition === 0}
            onHover={() => setHoveredPosition(0)}
            onLeave={() => setHoveredPosition(null)}
            onClick={() => onCardInsertPosition?.(0)}
          />
        )}

        {cards.map((card, index) => (
          <div key={card.id} className="flex items-end">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', duration: 0.3 }}
              style={{ marginLeft: index > 0 ? '-8px' : '0' }}
            >
              <ScoutCard
                card={card}
                isSelected={selectedCardIds.includes(card.id)}
                isPlayable={!disabled}
                onClick={() => onCardClick?.(card.id)}
                size="medium"
              />
            </motion.div>

            {/* Insert position after this card */}
            {showInsertPositions && (
              <InsertPosition
                index={index + 1}
                isHovered={hoveredPosition === index + 1}
                onHover={() => setHoveredPosition(index + 1)}
                onLeave={() => setHoveredPosition(null)}
                onClick={() => onCardInsertPosition?.(index + 1)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Selection info */}
      {selectedCardIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-3"
        >
          <span className="text-amber-300 text-sm">
            {selectedCardIds.length} carta{selectedCardIds.length > 1 ? 's' : ''} seleccionada{selectedCardIds.length > 1 ? 's' : ''}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Insert position indicator
function InsertPosition({
  index,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <motion.button
      className={`
        w-6 h-20 rounded flex items-center justify-center
        transition-all duration-200 mx-0.5
        ${isHovered ? 'bg-amber-500/30 border-2 border-amber-400 border-dashed' : 'bg-transparent border-2 border-transparent'}
      `}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {isHovered && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-amber-400 text-lg"
        >
          +
        </motion.span>
      )}
    </motion.button>
  );
}

// Opponent hand display (horizontal)
export function OpponentHand({
  playerName,
  cardCount,
  isCurrentTurn,
  capturedCards,
  scoutTokens,
}: {
  playerName: string;
  cardCount: number;
  isCurrentTurn: boolean;
  capturedCards: number;
  scoutTokens: number;
}) {
  return (
    <motion.div
      className={`
        rounded-xl p-3 text-center
        ${isCurrentTurn
          ? 'bg-amber-500/20 border border-amber-500/50'
          : 'bg-slate-900/50 border border-slate-700/50'
        }
      `}
      animate={isCurrentTurn ? {
        boxShadow: ['0 0 0 rgba(251, 191, 36, 0)', '0 0 20px rgba(251, 191, 36, 0.3)', '0 0 0 rgba(251, 191, 36, 0)'],
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Player name */}
      <div className={`font-medium mb-2 ${isCurrentTurn ? 'text-amber-300' : 'text-white/70'}`}>
        {playerName}
        {isCurrentTurn && <span className="ml-2 text-xs">🎪</span>}
      </div>

      {/* Card backs */}
      <div className="flex items-center justify-center gap-0.5 mb-2">
        {Array.from({ length: cardCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <ScoutCardBack size="small" />
          </motion.div>
        ))}
        {cardCount === 0 && (
          <span className="text-amber-400/50 text-xs">Sin cartas</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-amber-400">🃏</span>
          <span className="text-white/60">{capturedCards}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-purple-400">★</span>
          <span className="text-white/60">{scoutTokens}</span>
        </div>
      </div>
    </motion.div>
  );
}
