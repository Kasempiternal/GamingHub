'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ScoutRound, ScoutPlayer } from '@/types/game';

interface ScoreBoardProps {
  players: ScoutPlayer[];
  totalScores: Record<string, number>;
  currentRound: number;
  totalRounds: number;
  rounds: ScoutRound[];
  isVisible?: boolean;
}

export function ScoreBoard({
  players,
  totalScores,
  currentRound,
  totalRounds,
  rounds,
  isVisible = true,
}: ScoreBoardProps) {
  // Sort players by total score
  const sortedPlayers = [...players].sort((a, b) =>
    (totalScores[b.id] || 0) - (totalScores[a.id] || 0)
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-amber-500/30 p-4 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-amber-400 font-bold text-lg">Puntuacion</h3>
            <span className="text-white/50 text-sm">Ronda {currentRound} de {totalRounds}</span>
          </div>

          {/* Score table */}
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => {
              const score = totalScores[player.id] || 0;
              const lastRound = rounds[rounds.length - 1];
              const lastRoundScore = lastRound?.scores.find(s => s.playerId === player.id);

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${index === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50'}
                  `}
                >
                  {/* Rank and name */}
                  <div className="flex items-center gap-3">
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white/60'}
                    `}>
                      {index + 1}
                    </span>
                    <span className={`font-medium ${index === 0 ? 'text-amber-300' : 'text-white/80'}`}>
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className="text-xs text-amber-400">👑</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    {lastRoundScore && (
                      <span className={`text-xs ${lastRoundScore.roundScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lastRoundScore.roundScore >= 0 ? '+' : ''}{lastRoundScore.roundScore}
                      </span>
                    )}
                    <span className={`text-xl font-bold ${index === 0 ? 'text-amber-400' : 'text-white'}`}>
                      {score}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Round end summary
export function RoundSummary({
  round,
  players,
  onContinue,
  isHost,
  isLastRound,
}: {
  round: ScoutRound;
  players: ScoutPlayer[];
  onContinue: () => void;
  isHost: boolean;
  isLastRound: boolean;
}) {
  const roundEnder = players.find(p => p.id === round.endedBy);

  // Sort scores by points
  const sortedScores = [...round.scores].sort((a, b) => b.roundScore - a.roundScore);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6 max-w-md mx-auto shadow-2xl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          className="text-4xl mb-2"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🎪
        </motion.div>
        <h2 className="text-2xl font-bold text-amber-400">Fin de Ronda {round.roundNumber}</h2>
        {roundEnder && (
          <p className="text-white/60 text-sm mt-1">
            {roundEnder.name} termino la ronda
          </p>
        )}
      </div>

      {/* Score breakdown */}
      <div className="space-y-3 mb-6">
        {sortedScores.map((score, index) => (
          <motion.div
            key={score.playerId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`
              p-3 rounded-lg
              ${index === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50'}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${index === 0 ? 'text-amber-300' : 'text-white/80'}`}>
                {score.playerName}
                {score.isRoundEnder && <span className="ml-2 text-xs">🏁</span>}
              </span>
              <span className={`text-xl font-bold ${score.roundScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {score.roundScore >= 0 ? '+' : ''}{score.roundScore}
              </span>
            </div>

            {/* Score breakdown */}
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <span className="text-amber-400">🃏</span>
                +{score.capturedCards}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-purple-400">★</span>
                +{score.scoutTokens}
              </span>
              {!score.isRoundEnder && score.cardsRemaining > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <span>🎴</span>
                  -{score.cardsRemaining}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue button */}
      {isHost && (
        <motion.button
          onClick={onContinue}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLastRound ? '🏆 Ver Resultados Finales' : '➡️ Siguiente Ronda'}
        </motion.button>
      )}

      {!isHost && (
        <div className="text-center text-white/50 text-sm">
          Esperando a que el host continue...
        </div>
      )}
    </motion.div>
  );
}

// Final game results
export function GameResults({
  players,
  totalScores,
  winnerId,
  onPlayAgain,
  isHost,
}: {
  players: ScoutPlayer[];
  totalScores: Record<string, number>;
  winnerId: string | null;
  onPlayAgain: () => void;
  isHost: boolean;
}) {
  const sortedPlayers = [...players].sort((a, b) =>
    (totalScores[b.id] || 0) - (totalScores[a.id] || 0)
  );
  const winner = players.find(p => p.id === winnerId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border-2 border-amber-500/50 p-8 max-w-md mx-auto shadow-2xl"
    >
      {/* Winner announcement */}
      <div className="text-center mb-8">
        <motion.div
          className="text-6xl mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🏆
        </motion.div>
        <motion.h2
          className="text-3xl font-bold text-amber-400"
          animate={{ textShadow: ['0 0 10px rgba(251,191,36,0.5)', '0 0 20px rgba(251,191,36,0.8)', '0 0 10px rgba(251,191,36,0.5)'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {winner?.name || 'Ganador'}
        </motion.h2>
        <p className="text-white/60 mt-2">Director del Circo Supremo</p>
      </div>

      {/* Final standings */}
      <div className="space-y-2 mb-6">
        {sortedPlayers.map((player, index) => {
          const score = totalScores[player.id] || 0;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`
                flex items-center justify-between p-4 rounded-xl
                ${index === 0
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border-2 border-amber-500/50'
                  : 'bg-slate-800/50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎪'}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </span>
                <span className={`font-bold ${index === 0 ? 'text-amber-300 text-lg' : 'text-white/80'}`}>
                  {player.name}
                </span>
              </div>
              <span className={`text-2xl font-bold ${index === 0 ? 'text-amber-400' : 'text-white'}`}>
                {score}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Play again button */}
      {isHost && (
        <motion.button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-red-600 text-white hover:from-amber-600 hover:to-red-700 shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🎪 Jugar de Nuevo
        </motion.button>
      )}

      {!isHost && (
        <div className="text-center text-white/50 text-sm">
          Esperando a que el host reinicie...
        </div>
      )}
    </motion.div>
  );
}

// Mini scoreboard for during game
export function MiniScoreBoard({ players, totalScores }: { players: ScoutPlayer[]; totalScores: Record<string, number> }) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {players.map(player => (
        <div
          key={player.id}
          className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full text-sm"
        >
          <span className="text-white/60">{player.name}</span>
          <span className="text-amber-400 font-bold">{totalScores[player.id] || 0}</span>
        </div>
      ))}
    </div>
  );
}
