'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ImpostorPlayer, ImpostorPhase } from '@/types/game';

interface PlayerCardProps {
  player: ImpostorPlayer;
  isMe: boolean;
  isSpeaking: boolean;
  phase: ImpostorPhase;
  votesReceived?: number;
  canVote?: boolean;
  hasVoted?: boolean;
  onVote?: () => void;
  showRole?: boolean;
  isRevealing?: boolean;
}

export function PlayerCard({
  player,
  isMe,
  isSpeaking,
  phase,
  votesReceived = 0,
  canVote = false,
  hasVoted = false,
  onVote,
  showRole = false,
  isRevealing = false,
}: PlayerCardProps) {
  const getRoleColor = () => {
    if (!showRole || !player.role) return 'bg-slate-700';
    switch (player.role) {
      case 'impostor':
        return 'bg-red-600';
      case 'civilian':
        return 'bg-green-600';
      default:
        return 'bg-slate-700';
    }
  };

  const getRoleText = () => {
    switch (player.role) {
      case 'impostor':
        return '😈 Impostor';
      case 'civilian':
        return '😇 Civil';
      default:
        return '';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: player.isEliminated ? 0.5 : 1,
        scale: 1,
        rotate: isRevealing ? [0, 10, -10, 0] : 0,
      }}
      transition={{
        layout: { duration: 0.3 },
        rotate: { duration: 0.5, repeat: isRevealing ? Infinity : 0 },
      }}
      whileHover={canVote ? { scale: 1.05 } : undefined}
      whileTap={canVote ? { scale: 0.95 } : undefined}
      onClick={() => canVote && onVote?.()}
      className={`
        relative p-4 rounded-2xl border-2 transition-all
        ${player.isEliminated ? 'border-slate-600 bg-slate-800/30' : 'border-slate-600 bg-slate-800/50'}
        ${isMe ? 'ring-2 ring-yellow-500/50' : ''}
        ${isSpeaking ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        ${canVote ? 'cursor-pointer hover:border-red-500 hover:bg-red-500/10' : ''}
        ${hasVoted ? 'opacity-50' : ''}
      `}
    >
      {/* Speaking indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10"
          >
            🎤 HABLANDO
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eliminated overlay */}
      {player.isEliminated && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            💀
          </motion.div>
        </div>
      )}

      {/* Vote count badge */}
      <AnimatePresence>
        {votesReceived > 0 && phase === 'voting' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -left-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg z-10"
          >
            {votesReceived}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player content */}
      <div className="text-center">
        {/* Avatar */}
        <motion.div
          className="text-4xl mb-2"
          animate={isSpeaking ? {
            scale: [1, 1.1, 1],
          } : undefined}
          transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
        >
          {player.avatar}
        </motion.div>

        {/* Name */}
        <p className={`font-semibold truncate ${isMe ? 'text-yellow-400' : 'text-white'}`}>
          {player.name}
          {isMe && <span className="text-xs ml-1">(Tu)</span>}
        </p>

        {/* Host badge */}
        {player.isHost && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            Host
          </span>
        )}

        {/* Role reveal */}
        <AnimatePresence>
          {showRole && player.role && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2"
            >
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm font-bold text-white
                ${getRoleColor()}
              `}>
                {getRoleText()}
              </span>
              {player.word && showRole && (
                <p className="text-xs text-slate-400 mt-1">
                  {player.word}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description status */}
        {phase === 'description' && !player.isEliminated && (
          <div className="mt-2">
            {player.hasDescribed ? (
              <span className="text-green-400 text-sm">✓ Describio</span>
            ) : (
              <span className="text-slate-400 text-sm">Esperando...</span>
            )}
          </div>
        )}

        {/* Vote status */}
        {phase === 'voting' && !player.isEliminated && (
          <div className="mt-2">
            {player.hasVoted ? (
              <span className="text-blue-400 text-sm">✓ Voto</span>
            ) : (
              <span className="text-slate-400 text-sm">Votando...</span>
            )}
          </div>
        )}

        {/* Points */}
        {player.points > 0 && (
          <div className="mt-2 text-yellow-400 text-sm font-semibold">
            ⭐ {player.points} pts
          </div>
        )}
      </div>

      {/* Vote prompt */}
      {canVote && !hasVoted && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-dashed border-red-500/50 flex items-center justify-center bg-red-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-red-400 font-bold text-sm px-3 py-1 bg-slate-900/80 rounded-full">
            Votar
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
