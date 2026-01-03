'use client';

import { motion } from 'framer-motion';

interface RoundIndicatorProps {
  currentRound: 1 | 2 | 3;
}

const ROUND_INFO = {
  1: {
    name: 'Descripciones',
    description: 'Usa cualquier palabra',
    icon: '💬',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-400',
  },
  2: {
    name: 'Una Palabra',
    description: 'Solo UNA palabra permitida',
    icon: '1',
    color: 'bg-amber-500',
    textColor: 'text-amber-400',
  },
  3: {
    name: 'Mimica',
    description: 'Sin hablar, solo gestos',
    icon: '🤫',
    color: 'bg-red-500',
    textColor: 'text-red-400',
  },
};

export function RoundIndicator({ currentRound }: RoundIndicatorProps) {
  const current = ROUND_INFO[currentRound];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700">
      {/* Round dots */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {([1, 2, 3] as const).map((round) => {
          const info = ROUND_INFO[round];
          const isActive = round === currentRound;
          const isPast = round < currentRound;

          return (
            <motion.div
              key={round}
              initial={{ scale: 0.8 }}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              className="relative"
            >
              {/* Dot */}
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                  ${isActive
                    ? `${info.color} text-white shadow-lg`
                    : isPast
                      ? 'bg-slate-600 text-slate-300'
                      : 'bg-slate-700 text-slate-500'
                  }
                `}
                animate={isActive ? { scale: [1, 1.1, 1] } : undefined}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                {round}
              </motion.div>

              {/* Connection line */}
              {round < 3 && (
                <div className={`
                  absolute top-1/2 left-full w-4 h-0.5 -translate-y-1/2
                  ${isPast ? 'bg-slate-500' : 'bg-slate-700'}
                `} />
              )}

              {/* Active indicator ring */}
              {isActive && (
                <motion.div
                  className={`absolute inset-0 rounded-full border-2 ${info.color.replace('bg-', 'border-')}`}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Current round info */}
      <motion.div
        key={currentRound}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">{current.icon}</span>
          <h3 className={`font-bold text-lg ${current.textColor}`}>
            Ronda {currentRound}: {current.name}
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          {current.description}
        </p>
      </motion.div>
    </div>
  );
}
