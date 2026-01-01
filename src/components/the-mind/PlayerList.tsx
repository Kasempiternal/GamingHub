'use client';

import { motion } from 'framer-motion';
import type { TheMindPlayer } from '@/types/game';

interface PlayerListProps {
  players: TheMindPlayer[];
  currentPlayerId: string | null;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {players.map((player, index) => {
        const isMe = player.id === currentPlayerId;
        const cardCount = player.cards.filter(c => c !== 0).length;

        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl
              ${isMe
                ? 'bg-sky-500/20 border border-sky-500/50'
                : 'bg-slate-800/50 border border-slate-700/50'
              }
            `}
          >
            {/* Host badge */}
            {player.isHost && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs">
                👑
              </div>
            )}

            {/* Ready indicator */}
            {player.isReady && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -left-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs"
              >
                ✓
              </motion.div>
            )}

            {/* Proposing star indicator */}
            {player.isProposingStar && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg"
              >
                ⭐
              </motion.div>
            )}

            {/* Player name */}
            <span className={`font-medium ${isMe ? 'text-sky-300' : 'text-white'}`}>
              {player.name}
              {isMe && ' (Tu)'}
            </span>

            {/* Card count */}
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <span>🃏</span>
              <span>{cardCount} {cardCount === 1 ? 'carta' : 'cartas'}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
