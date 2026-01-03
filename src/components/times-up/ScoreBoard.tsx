'use client';

import { motion } from 'framer-motion';
import type { TimesUpGameState, TimesUpTeam } from '@/types/game';

interface ScoreBoardProps {
  game: TimesUpGameState;
}

const TEAM_CONFIG = {
  orange: {
    name: 'Naranja',
    icon: '🌞',
    gradient: 'from-orange-600 to-amber-500',
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
  },
  blue: {
    name: 'Azul',
    icon: '🌙',
    gradient: 'from-blue-600 to-cyan-500',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
  },
};

export function ScoreBoard({ game }: ScoreBoardProps) {
  const winner = game.winner;
  const winnerConfig = winner ? TEAM_CONFIG[winner] : null;

  // Calculate scores per round
  const roundScores = game.roundScores || [];

  const renderTeamColumn = (team: TimesUpTeam) => {
    const config = TEAM_CONFIG[team];
    const totalScore = team === 'orange' ? game.orangeScore : game.blueScore;
    const isWinner = winner === team;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: team === 'orange' ? 0.2 : 0.3 }}
        className={`
          flex-1 rounded-2xl p-4 border-2
          ${isWinner
            ? `${config.bg} border-current ${config.text}`
            : 'bg-slate-800/50 border-slate-700'
          }
        `}
      >
        {/* Team header */}
        <div className="text-center mb-4">
          <motion.span
            className="text-4xl inline-block"
            animate={isWinner ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : undefined}
            transition={{ duration: 1, repeat: isWinner ? Infinity : 0 }}
          >
            {config.icon}
          </motion.span>
          <h3 className={`font-bold text-lg mt-2 ${isWinner ? config.text : 'text-white'}`}>
            {config.name}
          </h3>
          {isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold"
            >
              <span>🏆</span>
              Ganador!
            </motion.div>
          )}
        </div>

        {/* Round scores */}
        <div className="space-y-2 mb-4">
          {roundScores.map((score, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: team === 'orange' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-xl"
            >
              <span className="text-slate-400 text-sm">Ronda {score.round}</span>
              <span className={`font-bold ${config.text}`}>
                {team === 'orange' ? score.orangeScore : score.blueScore}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Total score */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
          className={`
            bg-gradient-to-r ${config.gradient}
            rounded-xl p-4 text-center
          `}
        >
          <p className="text-white/80 text-sm">Total</p>
          <motion.p
            className="text-4xl font-bold text-white"
            animate={isWinner ? { scale: [1, 1.1, 1] } : undefined}
            transition={{ duration: 0.5, repeat: isWinner ? Infinity : 0 }}
          >
            {totalScore}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Winner announcement */}
      {winner && winnerConfig && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="text-6xl inline-block"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🏆
          </motion.div>
          <h2 className="text-2xl font-bold text-white mt-4">
            Equipo {winnerConfig.name} gana!
          </h2>
          <p className="text-slate-400 mt-2">
            {game.orangeScore} - {game.blueScore}
          </p>
        </motion.div>
      )}

      {/* Score columns */}
      <div className="flex gap-4">
        {renderTeamColumn('orange')}
        {renderTeamColumn('blue')}
      </div>

      {/* Round summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
      >
        <h4 className="text-slate-400 text-sm font-medium mb-3 text-center">
          Resumen por Ronda
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div className="text-slate-500">Ronda</div>
          <div className="text-orange-400 font-medium">Naranja</div>
          <div className="text-blue-400 font-medium">Azul</div>
          <div className="text-slate-400">Diff</div>

          {roundScores.map((score) => (
            <>
              <div key={`r${score.round}`} className="text-white font-bold">{score.round}</div>
              <div key={`o${score.round}`} className="text-orange-300">{score.orangeScore}</div>
              <div key={`b${score.round}`} className="text-blue-300">{score.blueScore}</div>
              <div
                key={`d${score.round}`}
                className={
                  score.orangeScore > score.blueScore
                    ? 'text-orange-400'
                    : score.blueScore > score.orangeScore
                      ? 'text-blue-400'
                      : 'text-slate-500'
                }
              >
                {score.orangeScore > score.blueScore
                  ? `+${score.orangeScore - score.blueScore}`
                  : score.blueScore > score.orangeScore
                    ? `+${score.blueScore - score.orangeScore}`
                    : '0'
                }
              </div>
            </>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
