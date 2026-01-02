'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScoutCard } from './ScoutCard';
import type { ScoutCurrentPlay, ScoutPlayer } from '@/types/game';

interface CurrentPlayProps {
  currentPlay: ScoutCurrentPlay | null;
  players: ScoutPlayer[];
  onScoutLeft?: () => void;
  onScoutRight?: () => void;
  canScout?: boolean;
  isSelectingScout?: boolean;
}

export function CurrentPlay({
  currentPlay,
  players,
  onScoutLeft,
  onScoutRight,
  canScout = false,
  isSelectingScout = false,
}: CurrentPlayProps) {
  const playOwner = currentPlay ? players.find(p => p.id === currentPlay.playerId) : null;

  return (
    <div className="relative">
      {/* Arena / Stage label */}
      <div className="text-center mb-3">
        <span className="text-amber-400/60 text-xs uppercase tracking-wider">Escenario</span>
      </div>

      {/* Play area */}
      <div className="relative min-h-[120px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentPlay ? (
            <motion.div
              key="current-play"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="relative"
            >
              {/* Glow effect behind cards */}
              <motion.div
                className="absolute inset-0 rounded-2xl blur-xl -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                  transform: 'scale(1.5)',
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Cards display */}
              <div className="flex items-center gap-4">
                {/* Scout left button */}
                {canScout && currentPlay.cards.length > 0 && (
                  <ScoutButton
                    direction="left"
                    onClick={onScoutLeft}
                    isActive={isSelectingScout}
                    cardValue={
                      currentPlay.cards[0].orientation === 'up'
                        ? currentPlay.cards[0].topValue
                        : currentPlay.cards[0].bottomValue
                    }
                  />
                )}

                {/* The cards */}
                <div className="flex items-center gap-1">
                  {currentPlay.cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -20, rotate: -10 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ScoutCard
                        card={card}
                        size="large"
                        isPlayable={false}
                        showBothValues={true}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Scout right button */}
                {canScout && currentPlay.cards.length > 0 && (
                  <ScoutButton
                    direction="right"
                    onClick={onScoutRight}
                    isActive={isSelectingScout}
                    cardValue={
                      currentPlay.cards[currentPlay.cards.length - 1].orientation === 'up'
                        ? currentPlay.cards[currentPlay.cards.length - 1].topValue
                        : currentPlay.cards[currentPlay.cards.length - 1].bottomValue
                    }
                  />
                )}
              </div>

              {/* Play info */}
              <div className="mt-3 text-center">
                <div className="text-white/60 text-sm">
                  {playOwner?.name || 'Jugador'}
                </div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <PlayTypeBadge type={currentPlay.playType} value={currentPlay.value} count={currentPlay.cards.length} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-28 mx-auto rounded-xl border-2 border-dashed border-amber-500/30 flex items-center justify-center mb-3">
                <span className="text-amber-500/30 text-2xl">🎪</span>
              </div>
              <div className="text-amber-400/50 text-sm">
                Juega cualquier carta o combinacion
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Scout button component
function ScoutButton({
  direction,
  onClick,
  isActive,
  cardValue,
}: {
  direction: 'left' | 'right';
  onClick?: () => void;
  isActive: boolean;
  cardValue: number;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center
        w-12 h-24 rounded-lg
        ${isActive
          ? 'bg-purple-600/30 border-2 border-purple-500'
          : 'bg-slate-800/50 border-2 border-slate-600/50 hover:border-purple-500/50'
        }
        transition-colors
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Arrow */}
      <motion.span
        className="text-purple-400 text-xl"
        animate={isActive ? { x: direction === 'left' ? [-2, 2, -2] : [2, -2, 2] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {direction === 'left' ? '←' : '→'}
      </motion.span>

      {/* Value preview */}
      <span className="text-purple-300 text-xs mt-1">{cardValue}</span>

      {/* Label */}
      <span className="text-purple-400/60 text-[10px] uppercase mt-1">Scout</span>
    </motion.button>
  );
}

// Play type badge
function PlayTypeBadge({ type, value, count }: { type: string; value: number; count: number }) {
  const labels = {
    single: 'Individual',
    set: 'Set',
    run: 'Escalera',
  };

  const colors = {
    single: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    set: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    run: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs border ${colors[type as keyof typeof colors]}`}>
      {labels[type as keyof typeof labels]} • {count} carta{count > 1 ? 's' : ''} • Valor: {value}
    </span>
  );
}

// Empty stage placeholder
export function EmptyStage() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        className="w-32 h-40 rounded-2xl border-2 border-dashed border-amber-500/20 flex items-center justify-center"
        animate={{
          borderColor: ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.4)', 'rgba(251, 191, 36, 0.2)'],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.span
          className="text-4xl text-amber-500/30"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎪
        </motion.span>
      </motion.div>
      <p className="text-amber-400/40 text-sm mt-4">El escenario esta vacio</p>
    </div>
  );
}
