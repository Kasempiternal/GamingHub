'use client';

import { motion } from 'framer-motion';

interface LevelIndicatorProps {
  currentLevel: number;
  maxLevel: number;
  lifeRewardLevels: number[];
  shurikenRewardLevels: number[];
}

export function LevelIndicator({
  currentLevel,
  maxLevel,
  lifeRewardLevels,
  shurikenRewardLevels,
}: LevelIndicatorProps) {
  const progress = (currentLevel / maxLevel) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Level number */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">Nivel</span>
        <motion.span
          key={currentLevel}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-white"
        >
          {currentLevel} / {maxLevel}
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Reward markers */}
        {[...lifeRewardLevels, ...shurikenRewardLevels].map((level) => {
          const position = (level / maxLevel) * 100;
          const isLife = lifeRewardLevels.includes(level);
          const isPast = currentLevel > level;

          return (
            <div
              key={`reward-${level}`}
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full
                flex items-center justify-center text-xs
                ${isPast ? 'bg-slate-600' : isLife ? 'bg-red-500' : 'bg-amber-500'}
              `}
              style={{ left: `calc(${position}% - 8px)` }}
            >
              {isLife ? '❤️' : '⭐'}
            </div>
          );
        })}
      </div>

      {/* Cards info */}
      <div className="text-center mt-2 text-slate-500 text-xs">
        {currentLevel} {currentLevel === 1 ? 'carta' : 'cartas'} por jugador
      </div>
    </div>
  );
}
