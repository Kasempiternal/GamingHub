'use client';

import { motion } from 'framer-motion';

interface CounterGuessButtonsProps {
  onSelect: (direction: 'left' | 'right') => void;
  disabled?: boolean;
  teamGuess: number;
  leftConcept: string;
  rightConcept: string;
}

export function CounterGuessButtons({
  onSelect,
  disabled = false,
  teamGuess,
  leftConcept,
  rightConcept,
}: CounterGuessButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-white/70 mb-2">
          El equipo contrario adivinó <span className="text-cyan-400 font-bold">{teamGuess}</span>
        </p>
        <p className="text-white text-lg font-medium">
          ¿Dónde crees que está el objetivo real?
        </p>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('left')}
          disabled={disabled}
          className={`
            flex-1 py-6 px-4 rounded-xl font-bold text-lg
            transition-all duration-200
            ${disabled
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
            }
          `}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">←</span>
            <span>IZQUIERDA</span>
            <span className="text-sm font-normal opacity-75 mt-1 truncate max-w-full">
              ({leftConcept})
            </span>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('right')}
          disabled={disabled}
          className={`
            flex-1 py-6 px-4 rounded-xl font-bold text-lg
            transition-all duration-200
            ${disabled
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 shadow-lg shadow-rose-500/20'
            }
          `}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">→</span>
            <span>DERECHA</span>
            <span className="text-sm font-normal opacity-75 mt-1 truncate max-w-full">
              ({rightConcept})
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
