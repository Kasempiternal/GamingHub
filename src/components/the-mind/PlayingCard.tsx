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
  isPlaying = false, // New prop for immediate feedback
}: PlayingCardProps & { isPlaying?: boolean }) {
  const sizeConfig = {
    sm: { card: 'w-12 h-16', center: 'text-xl', corner: 'text-[8px]' },
    md: { card: 'w-16 h-22', center: 'text-3xl', corner: 'text-[10px]' },
    lg: { card: 'w-20 h-28', center: 'text-4xl', corner: 'text-xs' },
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

  const getAccentColor = () => {
    if (isConflict) return 'border-red-300/40';
    if (isPlayed) return 'border-slate-300/30';
    if (value <= 20) return 'border-emerald-200/40';
    if (value <= 40) return 'border-sky-200/40';
    if (value <= 60) return 'border-amber-200/40';
    if (value <= 80) return 'border-orange-200/40';
    return 'border-rose-200/40';
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlayable && onClick && !isPlaying) {
      onClick();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={{
        opacity: isPlaying ? 0.5 : 1,
        scale: isPlaying ? 0.8 : 1,
        rotateY: 0,
        y: isPlaying ? -20 : 0,
      }}
      transition={{ duration: 0.3, delay: isPlaying ? 0 : delay }}
      whileHover={isPlayable && !isPlaying ? { scale: 1.1, y: -8 } : {}}
      whileTap={isPlayable && !isPlaying ? { scale: 0.9 } : {}}
      onClick={handleClick}
      onTouchEnd={handleClick}
      disabled={!isPlayable || isPlaying}
      style={{ touchAction: 'manipulation' }}
      className={`
        ${sizeConfig[size].card}
        relative rounded-xl font-bold
        bg-gradient-to-br ${getCardColor()}
        flex items-center justify-center
        shadow-lg
        ${isPlayable && !isPlaying ? 'cursor-pointer hover:shadow-xl hover:shadow-white/20 active:scale-90' : 'cursor-default opacity-90'}
        ${isConflict ? 'animate-shake' : ''}
        ${isPlaying ? 'ring-4 ring-white/50 animate-pulse' : ''}
        transition-all duration-150
        select-none
        overflow-hidden
      `}
    >
      {/* Card face background */}
      <div className="absolute inset-[3px] rounded-lg bg-slate-900/90 backdrop-blur" />

      {/* Inner decorative border */}
      <div className={`absolute inset-[5px] rounded-md border-2 ${getAccentColor()}`} />

      {/* Corner numbers - top left */}
      <div className={`absolute top-1.5 left-1.5 ${sizeConfig[size].corner} text-white/90 font-bold leading-none`}>
        {value}
      </div>

      {/* Corner numbers - bottom right (rotated) */}
      <div className={`absolute bottom-1.5 right-1.5 ${sizeConfig[size].corner} text-white/90 font-bold leading-none rotate-180`}>
        {value}
      </div>

      {/* Center number with decorative styling */}
      <div className="relative z-10 flex flex-col items-center">
        <span className={`${sizeConfig[size].center} font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
          {value}
        </span>
      </div>

      {/* Diamond decoration above and below center number */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/30 rotate-45" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/30 rotate-45" />

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl pointer-events-none" />

      {/* Glow effect for playable cards */}
      {isPlayable && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-white/10 to-white/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
