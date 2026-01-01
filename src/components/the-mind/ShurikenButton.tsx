'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TheMindPlayer } from '@/types/game';

interface ShurikenButtonProps {
  shurikens: number;
  maxShurikens: number;
  isProposing: boolean;
  proposerCount: number;
  totalPlayers: number;
  players: TheMindPlayer[];
  canPropose: boolean;
  onPropose: () => void;
  onCancel: () => void;
}

export function ShurikenButton({
  shurikens,
  isProposing,
  proposerCount,
  totalPlayers,
  players,
  canPropose,
  onPropose,
  onCancel,
}: ShurikenButtonProps) {
  const proposingPlayers = players.filter(p => p.isProposingStar);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Shuriken count */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Shurikens</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={{
                scale: i < shurikens ? 1 : 0.7,
                opacity: i < shurikens ? 1 : 0.3,
              }}
              className="text-xl"
            >
              {i < shurikens ? '⭐' : '✩'}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Propose button */}
      {shurikens > 0 && canPropose && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isProposing ? onCancel : onPropose}
          className={`
            px-6 py-3 rounded-xl font-medium text-sm
            transition-all duration-200
            ${isProposing
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }
          `}
        >
          <span className="flex items-center gap-2">
            <span>⭐</span>
            {isProposing ? 'Cancelar propuesta' : 'Proponer Shuriken'}
          </span>
        </motion.button>
      )}

      {/* Proposer status */}
      <AnimatePresence>
        {proposerCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-center"
          >
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                ⭐
              </motion.div>
              <span>
                {proposerCount} / {totalPlayers} proponen usar Shuriken
              </span>
            </div>

            {/* Who is proposing */}
            <div className="flex flex-wrap justify-center gap-1">
              {proposingPlayers.map(player => (
                <span
                  key={player.id}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs"
                >
                  {player.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {shurikens > 0 && canPropose && proposerCount === 0 && (
        <p className="text-slate-500 text-xs text-center max-w-xs">
          Todos deben proponer para usar el Shuriken. Cada jugador descartara su carta mas baja.
        </p>
      )}
    </div>
  );
}
