'use client';

import { motion } from 'framer-motion';
import type { WavelengthTeam } from '@/types/game';

interface TeamScoreboardProps {
  redScore: number;
  blueScore: number;
  targetScore: number;
  currentTeam: WavelengthTeam;
  redTeamNames: string[];
  blueTeamNames: string[];
  psychicId?: string;
  players: { id: string; name: string; team: WavelengthTeam | null }[];
}

export function TeamScoreboard({
  redScore,
  blueScore,
  targetScore,
  currentTeam,
  redTeamNames,
  blueTeamNames,
  psychicId,
  players,
}: TeamScoreboardProps) {
  const redTeamPlayers = players.filter(p => p.team === 'red');
  const blueTeamPlayers = players.filter(p => p.team === 'blue');

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Score header */}
      <div className="flex items-center justify-between mb-4">
        {/* Red team score */}
        <motion.div
          className={`flex-1 text-center p-3 rounded-lg ${
            currentTeam === 'red' ? 'bg-red-500/30 ring-2 ring-red-500' : 'bg-red-500/10'
          }`}
          animate={{ scale: currentTeam === 'red' ? 1.02 : 1 }}
        >
          <div className="text-xs text-red-400 uppercase tracking-wide mb-1">Equipo Rojo</div>
          <div className="text-3xl font-bold text-red-500">{redScore}</div>
        </motion.div>

        {/* VS / Target */}
        <div className="px-4 text-center">
          <div className="text-white/40 text-sm">META</div>
          <div className="text-xl font-bold text-white">{targetScore}</div>
        </div>

        {/* Blue team score */}
        <motion.div
          className={`flex-1 text-center p-3 rounded-lg ${
            currentTeam === 'blue' ? 'bg-blue-500/30 ring-2 ring-blue-500' : 'bg-blue-500/10'
          }`}
          animate={{ scale: currentTeam === 'blue' ? 1.02 : 1 }}
        >
          <div className="text-xs text-blue-400 uppercase tracking-wide mb-1">Equipo Azul</div>
          <div className="text-3xl font-bold text-blue-500">{blueScore}</div>
        </motion.div>
      </div>

      {/* Progress bars */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${(redScore / targetScore) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(blueScore / targetScore) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Team members */}
      <div className="flex gap-4">
        {/* Red team members */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-1">
            {redTeamPlayers.map((p) => (
              <div
                key={p.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  p.id === psychicId
                    ? 'bg-red-500 text-white font-bold'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {p.name}
                {p.id === psychicId && ' 🔮'}
              </div>
            ))}
          </div>
        </div>

        {/* Blue team members */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-1 justify-end">
            {blueTeamPlayers.map((p) => (
              <div
                key={p.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  p.id === psychicId
                    ? 'bg-blue-500 text-white font-bold'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                {p.id === psychicId && '🔮 '}
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
