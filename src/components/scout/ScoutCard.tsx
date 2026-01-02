'use client';

import { motion } from 'framer-motion';
import type { ScoutCard as ScoutCardType } from '@/types/game';

interface ScoutCardProps {
  card: ScoutCardType;
  isSelected?: boolean;
  isPlayable?: boolean;
  isHidden?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showBothValues?: boolean;
}

export function ScoutCard({
  card,
  isSelected = false,
  isPlayable = true,
  isHidden = false,
  onClick,
  size = 'medium',
  showBothValues = true,
}: ScoutCardProps) {
  const sizes = {
    small: { width: 'w-12', height: 'h-18', text: 'text-lg', smallText: 'text-xs' },
    medium: { width: 'w-16', height: 'h-24', text: 'text-2xl', smallText: 'text-sm' },
    large: { width: 'w-20', height: 'h-30', text: 'text-3xl', smallText: 'text-base' },
  };

  const s = sizes[size];
  const activeValue = card.orientation === 'up' ? card.topValue : card.bottomValue;
  const inactiveValue = card.orientation === 'up' ? card.bottomValue : card.topValue;

  // Card back for hidden cards
  if (isHidden) {
    return (
      <div
        className={`${s.width} ${s.height} rounded-lg bg-gradient-to-br from-red-800 to-red-900 border-2 border-amber-600/50 flex items-center justify-center shadow-lg`}
      >
        <div className="text-amber-500/30 text-2xl">★</div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isPlayable || !onClick}
      className={`
        ${s.width} ${s.height} rounded-lg relative overflow-hidden
        ${isPlayable && onClick ? 'cursor-pointer' : 'cursor-default'}
        transition-all duration-200
        ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-transparent' : ''}
      `}
      whileHover={isPlayable && onClick ? { y: -8, scale: 1.05 } : {}}
      whileTap={isPlayable && onClick ? { scale: 0.95 } : {}}
      animate={isSelected ? { y: -12 } : { y: 0 }}
    >
      {/* Card background - vintage paper look */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 rounded-lg" />

      {/* Gold border */}
      <div className="absolute inset-0 rounded-lg border-2 border-amber-500 shadow-lg" />
      <div className="absolute inset-[3px] rounded-md border border-amber-400/50" />

      {/* Corner decorations */}
      <div className="absolute top-1 left-1 text-amber-600/40 text-[8px]">★</div>
      <div className="absolute top-1 right-1 text-amber-600/40 text-[8px]">★</div>
      <div className="absolute bottom-1 left-1 text-amber-600/40 text-[8px]">★</div>
      <div className="absolute bottom-1 right-1 text-amber-600/40 text-[8px]">★</div>

      {/* Card content */}
      <div className="relative h-full flex flex-col items-center justify-center">
        {showBothValues ? (
          <>
            {/* Top value (active if orientation is 'up') */}
            <div
              className={`
                ${s.text} font-bold
                ${card.orientation === 'up' ? 'text-red-700' : 'text-amber-700/40'}
              `}
            >
              {card.topValue}
            </div>

            {/* Divider line */}
            <div className="w-8 h-[1px] bg-amber-400/60 my-1" />

            {/* Bottom value (active if orientation is 'down') */}
            <div
              className={`
                ${s.text} font-bold rotate-180
                ${card.orientation === 'down' ? 'text-red-700' : 'text-amber-700/40'}
              `}
            >
              {card.bottomValue}
            </div>
          </>
        ) : (
          // Show only active value
          <div className={`${s.text} font-bold text-red-700`}>
            {activeValue}
          </div>
        )}
      </div>

      {/* Highlight glow when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(251, 191, 36, 0.2)',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Inactive overlay */}
      {!isPlayable && (
        <div className="absolute inset-0 bg-black/30 rounded-lg" />
      )}
    </motion.button>
  );
}

// Card back component for showing opponent's hands
export function ScoutCardBack({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizes = {
    small: { width: 'w-10', height: 'h-14' },
    medium: { width: 'w-14', height: 'h-20' },
    large: { width: 'w-18', height: 'h-26' },
  };

  const s = sizes[size];

  return (
    <div
      className={`
        ${s.width} ${s.height} rounded-lg relative overflow-hidden
        bg-gradient-to-br from-red-800 via-red-900 to-red-950
        border-2 border-amber-600/60 shadow-lg
      `}
    >
      {/* Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(251,191,36,0.1)_10px,rgba(251,191,36,0.1)_20px)]" />
      </div>

      {/* Center star */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-amber-500/40 text-xl">★</span>
      </div>

      {/* Gold corners */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-500/50" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-amber-500/50" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-amber-500/50" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-500/50" />
    </div>
  );
}

// Flip animation wrapper
export function FlippableCard({
  card,
  isFlipped,
  onFlip,
  ...props
}: ScoutCardProps & { isFlipped: boolean; onFlip?: () => void }) {
  return (
    <motion.div
      className="relative perspective-1000"
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      onClick={onFlip}
    >
      <div
        className="backface-hidden"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <ScoutCard card={card} {...props} />
      </div>
      <div
        className="absolute inset-0 backface-hidden"
        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <ScoutCard
          card={{
            ...card,
            orientation: card.orientation === 'up' ? 'down' : 'up',
          }}
          {...props}
        />
      </div>
    </motion.div>
  );
}
