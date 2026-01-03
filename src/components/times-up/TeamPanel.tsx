'use client';

import { motion } from 'framer-motion';
import type { TimesUpPlayer, TimesUpTeam } from '@/types/game';

interface TeamPanelProps {
  team: TimesUpTeam;
  players: TimesUpPlayer[];
  score: number;
  currentPlayerId: string | null;
  isCurrentTeam: boolean;
}

const TEAM_COLORS = {
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
    gradient: 'from-orange-600 to-amber-500',
    name: 'Naranja',
    icon: 'sun',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
    gradient: 'from-blue-600 to-cyan-500',
    name: 'Azul',
    icon: 'moon',
  },
};

export function TeamPanel({
  team,
  players,
  score,
  currentPlayerId,
  isCurrentTeam,
}: TeamPanelProps) {
  const colors = TEAM_COLORS[team];

  return (
    <motion.div
      initial={{ opacity: 0, x: team === 'orange' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        ${colors.bg} rounded-2xl p-4 border-2
        ${isCurrentTeam ? colors.border : 'border-transparent'}
        transition-all duration-300
      `}
    >
      {/* Team header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={isCurrentTeam ? { scale: [1, 1.2, 1] } : undefined}
            transition={{ duration: 1, repeat: isCurrentTeam ? Infinity : 0 }}
          >
            {team === 'orange' ? '🌞' : '🌙'}
          </motion.span>
          <h3 className={`font-bold ${colors.text}`}>
            Equipo {colors.name}
          </h3>
        </div>

        {/* Score */}
        <motion.div
          key={score}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className={`
            bg-gradient-to-r ${colors.gradient}
            px-3 py-1 rounded-full text-white font-bold text-lg
          `}
        >
          {score}
        </motion.div>
      </div>

      {/* Players list */}
      <div className="space-y-2">
        {players.map((player) => (
          <motion.div
            key={player.id}
            layout
            className={`
              flex items-center gap-2 p-2 rounded-xl
              ${player.id === currentPlayerId
                ? `${colors.bg} ring-2 ring-offset-2 ring-offset-slate-900 ${colors.border.replace('border', 'ring')}`
                : 'bg-slate-800/50'
              }
              transition-all duration-200
            `}
          >
            {/* Avatar */}
            <span className="text-xl">{player.avatar}</span>

            {/* Name */}
            <span className={`
              flex-1 text-sm font-medium truncate
              ${player.id === currentPlayerId ? 'text-white' : 'text-slate-300'}
            `}>
              {player.name}
            </span>

            {/* Current player indicator */}
            {player.id === currentPlayerId && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white`}
              >
                Tu turno
              </motion.div>
            )}

            {/* Host badge */}
            {player.isHost && (
              <span className="text-yellow-400 text-xs">Host</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {players.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">
          No hay jugadores
        </p>
      )}

      {/* Current team indicator */}
      {isCurrentTeam && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 text-center py-2 rounded-xl ${colors.bg} ${colors.text} text-sm font-medium`}
        >
          Turno actual
        </motion.div>
      )}
    </motion.div>
  );
}
