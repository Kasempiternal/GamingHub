'use client';

import { motion } from 'framer-motion';
import type { TimesUpPlayer, TimesUpTeam } from '@/types/game';

interface TeamSelectorProps {
  players: TimesUpPlayer[];
  currentPlayerId: string;
  onSelectTeam: (team: TimesUpTeam) => void;
}

const TEAM_CONFIG = {
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500',
    hoverBg: 'hover:bg-orange-500/30',
    text: 'text-orange-400',
    gradient: 'from-orange-600 to-amber-500',
    name: 'Naranja',
    icon: '🌞',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    hoverBg: 'hover:bg-blue-500/30',
    text: 'text-blue-400',
    gradient: 'from-blue-600 to-cyan-500',
    name: 'Azul',
    icon: '🌙',
  },
};

export function TeamSelector({
  players,
  currentPlayerId,
  onSelectTeam,
}: TeamSelectorProps) {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const orangePlayers = players.filter(p => p.team === 'orange');
  const bluePlayers = players.filter(p => p.team === 'blue');
  const unassignedPlayers = players.filter(p => p.team === null);

  const renderTeamColumn = (team: TimesUpTeam) => {
    const config = TEAM_CONFIG[team];
    const teamPlayers = team === 'orange' ? orangePlayers : bluePlayers;
    const isCurrentTeam = currentPlayer?.team === team;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        {/* Team header button */}
        <button
          onClick={() => onSelectTeam(team)}
          disabled={isCurrentTeam}
          className={`
            w-full p-4 rounded-2xl border-2 transition-all
            ${isCurrentTeam
              ? `${config.bg} ${config.border}`
              : `bg-slate-800/50 border-slate-700 ${config.hoverBg}`
            }
            ${!isCurrentTeam ? 'cursor-pointer' : 'cursor-default'}
          `}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">{config.icon}</span>
            <h3 className={`font-bold text-lg ${config.text}`}>
              {config.name}
            </h3>
          </div>
          <p className="text-slate-400 text-sm">
            {teamPlayers.length} jugadores
          </p>
        </button>

        {/* Team players */}
        <div className="mt-3 space-y-2">
          {teamPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: team === 'orange' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-2 p-3 rounded-xl
                ${player.id === currentPlayerId
                  ? `${config.bg} ring-2 ${config.border.replace('border', 'ring')}`
                  : 'bg-slate-800/50'
                }
              `}
            >
              <span className="text-xl">{player.avatar}</span>
              <span className={`
                flex-1 font-medium truncate
                ${player.id === currentPlayerId ? 'text-white' : 'text-slate-300'}
              `}>
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="text-slate-400 text-xs ml-1">(Tu)</span>
                )}
              </span>
              {player.isHost && (
                <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-0.5 rounded-full">
                  Host
                </span>
              )}
            </motion.div>
          ))}

          {teamPlayers.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">
              Toca arriba para unirte
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Elige tu equipo</h2>
        <p className="text-slate-400 text-sm">
          Toca un equipo para unirte
        </p>
      </div>

      {/* Teams */}
      <div className="flex gap-4">
        {renderTeamColumn('orange')}
        {renderTeamColumn('blue')}
      </div>

      {/* Unassigned players */}
      {unassignedPlayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
        >
          <h4 className="text-slate-400 text-sm font-medium mb-3 flex items-center gap-2">
            <span>👻</span>
            Sin equipo ({unassignedPlayers.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl
                  ${player.id === currentPlayerId
                    ? 'bg-slate-700 ring-2 ring-slate-500'
                    : 'bg-slate-800'
                  }
                `}
              >
                <span className="text-lg">{player.avatar}</span>
                <span className="text-slate-300 text-sm">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="text-slate-500 text-xs ml-1">(Tu)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
