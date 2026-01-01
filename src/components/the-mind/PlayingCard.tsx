'use client';

import { motion } from 'framer-motion';

interface PlayingCardProps {
  value: number;
  isPlayable?: boolean;
  isPlayed?: boolean;
  isConflict?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  delay?: number;
}

export function PlayingCard({
  value,
  isPlayable = false,
  isPlayed = false,
  isConflict = false,
  size = 'md',
  onClick,
  delay = 0,
}: PlayingCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-lg',
    md: 'w-16 h-22 text-2xl',
    lg: 'w-20 h-28 text-3xl',
  };

  const getCardColor = () => {
    if (isConflict) return 'from-red-500 to-red-700';
    if (isPlayed) return 'from-slate-400 to-slate-500';
    // Color based on card value range
    if (value <= 20) return 'from-emerald-400 to-emerald-600';
    if (value <= 40) return 'from-sky-400 to-sky-600';
    if (value <= 60) return 'from-amber-400 to-amber-600';
    if (value <= 80) return 'from-orange-400 to-orange-600';
    return 'from-rose-400 to-rose-600';
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={isPlayable ? { scale: 1.1, y: -8 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      disabled={!isPlayable}
      className={`
        ${sizeClasses[size]}
        relative rounded-xl font-bold
        bg-gradient-to-br ${getCardColor()}
        flex items-center justify-center
        shadow-lg
        ${isPlayable ? 'cursor-pointer hover:shadow-xl' : 'cursor-default opacity-90'}
        ${isConflict ? 'animate-shake' : ''}
        transition-shadow duration-200
        select-none
      `}
    >
      {/* Card pattern */}
      <div className="absolute inset-1 rounded-lg border-2 border-white/20" />

      {/* Number */}
      <span className="text-white drop-shadow-lg">{value}</span>

      {/* Glow effect for playable cards */}
      {isPlayable && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-white/20"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
